/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />

import OpticConfig from "~/types/OpticConfig";
import handleRequest from "./handleRequest";

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
export declare var self: ServiceWorkerGlobalScope;

const params = new URLSearchParams(location.search);
if (!params.get("config")) {
  throw new Error("No config provided");
}
try {
  JSON.parse(params.get("config") as string);
} catch {
  throw new Error("Invalid config provided");
}
const config = JSON.parse(params.get("config") as string) as OpticConfig;
importScripts(
  `${config.shared}${
    config.disableCache
      ? `?cache=${Math.floor(Math.random() * 900000) + 100000}`
      : ""
  }}`
);

self.addEventListener("install", () => {
  if (config.logLevel && config.logLevel >= 2)
    console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});