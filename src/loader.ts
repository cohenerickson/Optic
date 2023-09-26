import codec from "./shared/codec";
import log from "./util/log";
import path from "path";

declare global {
  interface Window {
    Optic: Optic;
  }
}

class Optic {
  constructor() {
    if (!__optic$config) {
      throw new Error("Optic config not found");
    }

    this.registerServiceWorker();
  }

  navigate(query: string) {
    let url: string;

    if (/^https?:\/\//.test(query)) {
      url = query;
    } else if (/^[^\s]+(\.[^\s]+)+$/.test(query)) {
      url = `https://${query}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    location.href = `${__optic$config.prefix}${codec.encode(url)}`;
  }

  registerServiceWorker(): void {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(
          `${path.join(
            __optic$config.files.dir,
            __optic$config.files.worker
          )}?config=${encodeURIComponent(
            `${__optic$config.files.dir}${__optic$config.files.config}`
          )}`,
          {
            scope: __optic$config.prefix,
            updateViaCache: "none"
          }
        )
        .then(async (registration) => {
          await registration.update();

          log.info("Optic service worker registered:", registration);
        })
        .catch((error) => {
          log.error("Optic service worker registration failed:", error);
        });
    } else {
      log.error(
        "Unable to register Optic service worker: navigator.serviceWorker not available"
      );
    }
  }
}

self.Optic = new Optic();
