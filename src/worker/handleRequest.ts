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
    [$optic.config.shared, $optic.config.client].includes(
      new URL(event.request.url, location.origin).pathname
    )
  ) {
    return fetch(event.request);
  }

  if ($optic.config.logLevel >= 3) {
    console.log("Service Worker handling fetch event", event.request);
  }

  const url = new URL(event.request.url, location.origin);

  if (url.pathname.substring($optic.config.prefix.length - 1) === "/navigate") {
    const navigateTo = url.searchParams.get("url");

    if (!navigateTo) {
      return new Response();
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${$optic.config.prefix}${$optic.encode(navigateTo)}`
      }
    });
  }

  const requestURL = $optic.decode(
    url.pathname.substring($optic.config.prefix.length)
  );

  try {
    new URL(requestURL);
  } catch (e) {
    return new Response();
  }

  const requestInit: BareFetchInit = {
    method: event.request.method,
    headers: rewriteHeaders.outgoing(event.request.headers),
    redirect: "manual"
  };

  if (!["GET", "HEAD"].includes(event.request.method)) {
    requestInit.body = event.request.body;
  }

  const request: BareResponseFetch = await bareClient.fetch(
    requestURL,
    requestInit
  );

  if (request.status === 301 && request.headers.has("location")) {
    return new Response(null, {
      status: 301,
      headers: {
        location: $optic.scopeURL(
          request.headers.get("location") as string,
          new URL(requestURL)
        )
      }
    });
  }

  let responseData: BodyInit | null | undefined;
  let responseInit: ResponseInit & { headers: Headers } = {
    status: request.status,
    statusText: request.statusText,
    headers: rewriteHeaders.incoming(request.headers)
  };

  if ([101, 204, 205, 304].includes(request.status)) {
    responseData = null;
  } else if (/text\/html/.test(request.headers.get("content-type") ?? "")) {
    const cache = $optic.config.disableCache
      ? Math.floor(Math.random() * 900000) + 100000
      : 0;
    if (cache) responseInit.headers.set("Cache-Control", "no-cache");
    responseData = `
      <script optic::internal src="${$optic.config.shared}${
      cache ? `?cache=${cache}` : ""
    }"></script>
      <script optic::internal>if(!("$optic"in window))$optic={};$optic.config=${JSON.stringify(
        $optic.config
      )};</script>
      <script optic::internal src="${$optic.config.client}${
      cache ? `?cache=${cache}` : ""
    }"></script>
      ${await request.text()}
    `;
  } else if (event.request.destination === "style") {
    responseData = $optic.rewriteCSS(await request.text(), new URL(requestURL));
  } else if (event.request.destination === "script") {
    responseData = $optic.rewriteJS(await request.text(), new URL(requestURL));
  } else {
    responseData = await request.blob();
  }

  return new Response(responseData, responseInit);
}
