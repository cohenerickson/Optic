import { createStorageProxy } from "./storage";

let onMessageHandler: any = null;
Object.defineProperty(window, "onmessage", {
  get() {
    return onMessageHandler;
  },
  set(value: any) {
    if (onMessageHandler)
      window.removeEventListener("message", onMessageHandler);
    onMessageHandler = value;
    window.addEventListener("message", value);
  }
});

let onStorageHandler: any = null;
Object.defineProperty(window, "onstorage", {
  get() {
    return onStorageHandler;
  },
  set(value: any) {
    if (onStorageHandler)
      window.removeEventListener("storage", onStorageHandler);
    onStorageHandler = value;
    window.addEventListener("storage", value);
  }
});

// @ts-ignore
window.addEventListener = new Proxy(window.addEventListener, {
  apply(target: Function, _, args: any[]): any {
    if (!args[1]) return target.apply(null, args);

    const [type, listener] = args;

    if (type === "message") {
      args[1] = (event: MessageEvent) => {
        const eventProxy = new Proxy(event, {
          get(target: MessageEvent, prop: string | symbol) {
            if (prop === "data") {
              return target.data.data;
            } else if (prop === "origin") {
              return target.data.emitter;
            }
          }
        });

        if (event.data.target === $optic.location.origin) listener(eventProxy);
      };
    } else if (type === "storage") {
      args[1] = (event: StorageEvent) => {
        const { origin } = new URL(
          $optic.decode(
            new URL(event.url).pathname.substring($optic.prefix.length)
          )
        );
        const eventProxy = new Proxy(event, {
          get(target: StorageEvent, prop: string | symbol) {
            if (prop === "url") {
              return $optic.decode(
                new URL(target.url).pathname.substring($optic.prefix.length)
              );
            } else if (target.key && prop === "key") {
              return target.key.slice(
                0,
                target.key.length - $optic.location.host.length - 1
              );
            } else if (prop === "storageArea") {
              return createStorageProxy(target[prop] as Storage);
            }

            return Reflect.get(target, prop);
          }
        });

        if (origin === $optic.location.origin) listener(eventProxy);
      };
    }

    target.apply(null, args);
  }
});

$optic.postMessage = (
  destination: Window,
  data: any,
  origin: string,
  transfer?: Transferable[]
) => {
  destination.postMessage(
    {
      emitter: $optic.location.origin,
      target: origin,
      data
    },
    location.origin,
    transfer
  );
};
