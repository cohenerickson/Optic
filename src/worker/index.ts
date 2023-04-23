/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />

import handleRequest from "./handleRequest";
import BareClient from "@tomphttp/bare-client";

export declare var self: ServiceWorkerGlobalScope;

const params = new URLSearchParams(location.search);
const config = JSON.parse(params.get("config") as string);
importScripts(
  `${config.shared}${
    config.disableCache
      ? `?cache=${Math.floor(Math.random() * 900000) + 100000}`
      : ""
  }}`
);

$optic.config = config;

const bareClient: BareClient = new $optic.libs.BareClient(
  new URL(config.bare, location.origin)
);

self.addEventListener("install", (event) => {
  if (config.logLevel && config.logLevel >= 2)
    console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event, bareClient));
});
