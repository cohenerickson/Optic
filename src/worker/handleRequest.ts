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
    console.log("Service Worker handling fetch event");
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

  try {
    new URL(requestURL);
  } catch {
    throw new Error("Invalid URL provided");
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
      <script src="${$optic.shared}${cache ? `?cache=${cache}` : ""}"></script>
      <script src="${$optic.client}${cache ? `?cache=${cache}` : ""}"></script>
      <script>Object.assign($optic, ${JSON.stringify(
        $optic
      )}, {libs: $optic.libs});</script>
      ${await request.text()}
    `;
  } else if (event.request.destination === "style") {
    responseData = $optic.rewriteCSS(await request.text(), new URL(requestURL));
  } else {
    responseData = await request.blob();
  }

  return new Response(responseData, responseInit);
}
