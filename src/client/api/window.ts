const backup = new Map<
  Window & typeof globalThis,
  Window & typeof globalThis
>();

export default function createWindowProxy(
  meta: Window & typeof globalThis
): Window & typeof globalThis {
  let bk = backup.get(meta);
  if (!bk) {
    bk = new Proxy(meta, {
      get(t, prop: string, r) {
        const value = meta[prop as any] as any;
        if (["parent", "top", "window", "globalThis", "this"].includes(prop)) {
          return $optic.scope(value);
        }

        if (prop === "postMessage") {
          return (data: any, origin: string, transfer?: Transferable[]) => {
            meta.postMessage(
              {
                emitter: $optic.scope(location).origin,
                target: origin,
                data
              },
              location.origin,
              transfer
            );
          };
        }

        if (typeof value === "function") {
          return value.bind(meta);
        }
        return $optic.scope(value);
      }
    });

    backup.set(meta, bk);
  }

  return bk;
}
