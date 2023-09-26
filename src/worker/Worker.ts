/// <reference lib="webworker" />
import { Blank, InvalidURL } from "./responses";
import { BareClient } from "@tomphttp/bare-client";
import EventEmitter from "events";
import path from "path";
import TypedEmitter from "typed-emitter";
import { Events } from "~/types/Plugin";
import log from "~/util/log";

declare var self: ServiceWorkerGlobalScope;

function incoming(headers: Headers): Headers {
  [
    "content-security-policy",
    "content-security-policy-report-only",
    "cache-control",
    "clear-site-data",
    "content-encoding",
    "content-length",
    "cross-origin-opener-policy",
    "cross-origin-opener-policy-report-only",
    "report-to",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options"
  ].forEach((header) => {
    headers.delete(header);
  });
  return headers;
}

export default class Worker extends (EventEmitter as new () => TypedEmitter<Events>) {
  bare: BareClient;

  constructor() {
    super();

    this.bare = new BareClient(__optic$config.bare);

    self.addEventListener("fetch", (event) => {
      let fulfilled = false;

      event.handled.then(() => {
        fulfilled = true;
      });

      this.emit("fetch", event);

      if (!fulfilled) {
        event.respondWith(
          (async () => {
            const response = await this.handle(event);
            this.emit("response", response);
            return response;
          })()
        );
      }
    });

    __optic$config.plugins?.forEach((plugin) => {
      if (plugin.worker) {
        try {
          plugin.worker(this);

          log.info(`Loaded plugin ${plugin.name}:`, plugin);
        } catch (e: unknown) {
          if (e instanceof Error) {
            log.error(`Error loading plugin ${plugin.name}`, e);
          }
        }
      }
    });
  }

  async handle(event: FetchEvent): Promise<Response> {
    const client = (await self.clients.matchAll()).find(
      (e) => e.id == event.clientId
    );
    const url = new URL(event.request.url);

    let scripts: string[] = Object.values(__optic$config.files);

    if (scripts.includes(path.basename(url.pathname))) {
      return await fetch(event.request);
    }

    log.info(`Recieved fetch event:`, event.request);

    const decodedURL = __$optic.codec.decode(
      url.pathname.substring(__optic$config.prefix.length)
    );

    let requestURL: URL;

    if (!validURL(decodedURL) && client) {
      const clientURL = new URL(
        __$optic.codec.decode(
          new URL(client.url).pathname.substring(__optic$config.prefix.length)
        )
      );
      if (url.origin === new URL(client.url).origin) {
        requestURL = new URL(url.pathname, clientURL);
      } else {
        requestURL = new URL(url.pathname, new URL(url.origin, clientURL));
      }
    } else if (!validURL(decodedURL)) {
      return new InvalidURL(decodedURL);
    } else {
      requestURL = new URL(decodedURL);
    }

    // allow modification of headers by plugins
    const requestHeaders = new Headers(event.request.headers);
    Object.defineProperty(event.request, "headers", {
      get: () => requestHeaders
    });

    this.emit("request", event.request, requestURL);

    if (/^about:(blank|srcdoc)/i.test(requestURL.toString())) {
      return new Blank(decodedURL);
    }

    const requestInit: RequestInit & { duplex: string } = {
      method: event.request.method,
      headers: event.request.headers,
      redirect: "manual",
      duplex: "half"
    };

    if (!["GET", "HEAD"].includes(event.request.method)) {
      requestInit.body = event.request.body;
    }

    const bareResponse = await this.bare.fetch(requestURL, requestInit);

    if (bareResponse.status === 301 && bareResponse.headers.has("location")) {
      return new Response(null, {
        status: 301,
        headers: {
          location: __$optic.rewrite.url(
            bareResponse.headers.get("location") as string,
            requestURL
          )
        }
      });
    }

    let responseData: BodyInit | null | undefined;
    let responseInit: ResponseInit = {
      status: bareResponse.status,
      statusText: bareResponse.statusText,
      headers: incoming(bareResponse.headers)
    };

    if ([101, 204, 205, 304].includes(bareResponse.status)) {
      responseData = null;
    } else if (
      /text\/html/.test(bareResponse.headers.get("content-type") ?? "")
    ) {
      responseData = __$optic.rewrite.html(await bareResponse.text());
    } else if (event.request.destination === "style") {
      responseData = __$optic.rewrite.css(
        await bareResponse.text(),
        new URL(requestURL)
      );
    } else if (
      event.request.destination === "script" ||
      event.request.destination.includes("worker")
    ) {
      responseData = __$optic.rewrite.js(
        await bareResponse.text(),
        new URL(requestURL),
        event.request.destination.includes("worker")
      );
    } else {
      responseData = await bareResponse.blob();
    }

    return new Response(responseData, responseInit);
  }
}

function validURL(url: string, meta?: string): boolean {
  try {
    new URL(url, meta);
    return true;
  } catch {
    return false;
  }
}
