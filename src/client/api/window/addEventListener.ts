import createStorageProxy from "./storage";
import scope from "~/client/scope";

function createEventProxy(name: string) {
  let handler: any = null;
  Object.defineProperty(window, `on${name}`, {
    get() {
      return handler;
    },
    set(value: any) {
      if (handler) window.removeEventListener(name, handler);
      handler = value;
      window.addEventListener(name, value);
    }
  });
}

createEventProxy("message");
createEventProxy("storage");

// @ts-ignore
window.addEventListener = new Proxy(window.addEventListener, {
  apply(
    target: Window["addEventListener"],
    _,
    args: [string, EventListenerOrEventListenerObject]
  ): any {
    if (!args[1]) return target.apply(null, args);

    const [type, listener] = args;

    if (type === "message") {
      args[1] = ((event: MessageEvent<OpticMessageEvent>) => {
        const eventProxy = new Proxy(event, {
          get(
            target: MessageEvent<OpticMessageEvent>,
            prop: keyof MessageEvent
          ) {
            if (prop === "data") {
              return target.data.message;
            } else if (prop === "origin") {
              return target.data.$emitter;
            }

            return scope(target[prop]);
          }
        });

        if (event.data.$targetOrigin === scope(location).origin) {
          if (typeof listener === "object") {
            listener.handleEvent(eventProxy);
          } else {
            listener(eventProxy);
          }
        }
      }) as EventListenerOrEventListenerObject;
    } else if (type === "storage") {
      args[1] = ((event: StorageEvent) => {
        const url = new URL(
          __$optic.codec.decode(
            new URL(event.url).pathname.substring(__optic$config.prefix.length)
          )
        );
        const { origin } = url;

        const eventProxy = new Proxy(event, {
          get(target: StorageEvent, prop: keyof StorageEvent) {
            if (prop === "url") {
              return url.toString();
            } else if (target.key && prop === "key") {
              return target.key.slice(
                0,
                target.key.length - scope(location).host.length - 1
              );
            } else if (prop === "storageArea") {
              return createStorageProxy(target[prop] as Storage);
            }

            return Reflect.get(target, prop);
          }
        });

        if (origin === scope(location).origin) {
          if (typeof listener === "object") {
            listener.handleEvent(eventProxy);
          } else {
            listener(eventProxy);
          }
        }
      }) as EventListenerOrEventListenerObject;
    }

    target.apply(null, args);
  }
});
