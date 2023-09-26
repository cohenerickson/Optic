import Worker from "./Worker";

/// <reference lib="webworker" />
declare var self: ServiceWorkerGlobalScope;

const config = decodeURIComponent(
  new URLSearchParams(location.search).get("config") || "optic.config.js"
);

importScripts(config);
importScripts(`${__optic$config.files.dir}${__optic$config.files.shared}`);

self.skipWaiting();

new Worker();

export default Worker;
