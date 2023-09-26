import scope from "~/client/scope";
import { globals } from "~/util/globals";

const backup = new Map<
  Window & typeof globalThis,
  Window & typeof globalThis
>();

export default function createWindowProxy(
  meta: Window & typeof globalThis
): Window & typeof globalThis {
  let bk = backup.get(meta);
  if (!bk) {
    bk = new Proxy(Object.setPrototypeOf({}, Window.prototype), {
      get(t, prop: string, r) {
        const value = meta[prop as any] as any;
        if (["parent", "top", "window", "globalThis", "this"].includes(prop)) {
          return scope(value);
        }

        if (prop === "postMessage") {
          return (
            message: any,
            targetOrigin: string,
            transfer?: Transferable[]
          ) => {
            meta.postMessage(
              {
                $emitter: scope(location).origin,
                $targetOrigin: targetOrigin,
                message
              } as OpticMessageEvent,
              "*",
              transfer
            );
          };
        }

        if (typeof value === "function") {
          return value.bind(meta);
        }

        return scope(value);
      },
      ownKeys(): ArrayLike<string | symbol> {
        return Object.keys(meta).filter((key) => !globals.includes(key));
      },
      getOwnPropertyDescriptor(): PropertyDescriptor {
        return {
          enumerable: true,
          configurable: true
        };
      }
    }) as Window & typeof globalThis;

    backup.set(meta, bk);
  }

  return bk;
}
