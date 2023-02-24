import BareClient, {
  BareFetchInit,
  BareResponseFetch
} from "@tomphttp/bare-client";
import * as rewriteHeaders from "./rewriteHeaders";

export default async function handleResponse(
  event: FetchEvent,
  bareClient: BareClient
): Promise<Response> {
  if (
    [$optic.shared, $optic.client].includes(
      new URL(event.request.url, location.origin).pathname
    )
  ) {
    return fetch(event.request);
  }

  if ($optic.logLevel >= 3) {
    console.log("Service Worker handling fetch event", event.request);
  }

  const url = new URL(event.request.url, location.origin);

  if (url.pathname.substring($optic.prefix.length - 1) === "/navigate") {
    const navigateTo = url.searchParams.get("url");

    if (!navigateTo) {
      throw new Error("No url provided");
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${$optic.prefix}${$optic.encode(navigateTo)}`
      }
    });
  }

  const requestURL = $optic.decode(
    url.pathname.substring($optic.prefix.length)
  );

  if (url.search || url.hash) {
    return new Response(
      `
    <script>
    location.href = "${$optic.scopeURL(
      requestURL + url.search + url.hash,
      url
    )}";
    </script>
    `,
      {
        headers: {
          "Content-Type": "text/html"
        }
      }
    );
  }

  try {
    new URL(requestURL);
  } catch {
    throw new Error(url.pathname);
  }

  const requestInit: BareFetchInit = {
    method: event.request.method,
    headers: rewriteHeaders.outgoing(event.request.headers)
  };

  if (!["GET", "HEAD"].includes(event.request.method)) {
    requestInit.body = event.request.body;
  }

  const request: BareResponseFetch = await bareClient.fetch(
    requestURL,
    requestInit
  );

  if (request.finalURL !== requestURL) {
    return new Response(
      `
        <script>
          location.href = "${$optic.scopeURL(
            request.finalURL,
            new URL(requestURL)
          )}";
        </script>
      `,
      {
        headers: {
          "Content-Type": "text/html"
        }
      }
    );
  }

  let responseData: BodyInit | null | undefined;
  let responseInit: ResponseInit & { headers: Headers } = {
    status: request.status,
    statusText: request.statusText,
    headers: rewriteHeaders.incoming(request.headers)
  };

  if ([101, 204, 205, 304].includes(request.status)) {
    responseData = null;
  } else if (
    ["iframe", "frame", "document"].includes(event.request.destination) ||
    /text\/html/.test(request.headers.get("content-type") ?? "")
  ) {
    const cache = $optic.disableCache
      ? Math.floor(Math.random() * 900000) + 100000
      : 0;
    if (cache) responseInit.headers.set("Cache-Control", "no-cache");
    responseData = `
      <script optic::internal src="${$optic.shared}${
      cache ? `?cache=${cache}` : ""
    }"></script>
      <script optic::internal>if(!("$optic"in window))$optic={};$optic.setConfig=\`Object.assign($optic,${JSON.stringify(
        $optic
      )},{libs: $optic.libs});\`;Function($optic.setConfig)();</script>
      <script optic::internal src="${$optic.client}${
      cache ? `?cache=${cache}` : ""
    }"></script>
      ${await request.text()}
    `;
  } else if (event.request.destination === "style") {
    responseData = $optic.rewriteCSS(await request.text(), new URL(requestURL));
  } else {
    responseData = await request.blob();
  }

  return new Response(responseData, responseInit);
}
