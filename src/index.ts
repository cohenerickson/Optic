/// <reference no-default-lib="true"/>
/// <reference lib="dom" />

class Instance {
  config?: any;

  constructor() {}

  async init(configPath: string): Promise<void> {
    const configFetch = await fetch(new URL(configPath, location.href));

    if (!configFetch.ok) {
      throw new Error(`Failed to load config from ${configPath}`);
    }

    try {
      this.config = await configFetch.json();
      this.registerServiceWorker();
    } catch (e) {
      throw new Error(`Failed to parse config from ${configPath}`);
    }
  }

  registerServiceWorker(): void {
    if (!this.config) {
      throw new Error("Optic not initialized");
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(
          `${this.config.worker}?config=${encodeURIComponent(
            JSON.stringify(this.config)
          )}${
            this.config.disableCache
              ? `&cache=${Math.floor(Math.random() * 900000) + 100000}`
              : ""
          }`,
          {
            scope: this.config.prefix,
            updateViaCache: "none"
          }
        )
        .then(
          async (registration) => {
            await registration.update();
            if (this.config?.logLevel && this.config?.logLevel >= 2)
              console.log("Optic service worker registered:", registration);
          },
          (error) => {
            console.error("Optic service worker registration failed:", error);
            throw error;
          }
        );
    } else {
      console.warn(
        "Optic service worker not registered: navigator.serviceWorker not available"
      );
    }
  }

  navigate(query: string): void {
    if (!this.config) {
      throw new Error("Optic not initialized");
    }

    let url: string;

    if (/^https?:\/\//.test(query)) {
      url = query;
    } else if (/^[^\s]+(\.[^\s]+)+$/) {
      url = `https://${query}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    location.replace(
      `${this.config.prefix}navigate?url=${encodeURIComponent(url)}`
    );
  }
}

// @ts-ignore
window.Optic = new Instance();
