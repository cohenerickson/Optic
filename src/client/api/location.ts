const backup = new Map<Location, Location>();

export default function createLocationProxy(meta: Location): Location {
  let bk = backup.get(meta);

  if (!bk) {
    bk = new Proxy(Object.setPrototypeOf({}, Location.prototype), {
      get(t, prop: string | symbol): any {
        let loc = new URL(meta.href);
        if (meta.href === "about:srcdoc" || meta.href === "about:blank") {
          loc = new URL(
            $optic.decode(parent.location.pathname.substring($optic.config.prefix.length))
          );
        } else {
          loc = new URL(
            $optic.decode(meta.pathname.substring($optic.config.prefix.length))
          ) as any;
        }

        if (prop === "constructor") {
          return meta.constructor;
        } else if (prop === Symbol.toStringTag) {
          return "Location";
        } else if (prop === "assign") {
          return (url: string) => {
            meta.assign($optic.scopeURL(url, $optic.scope(meta)));
          };
        } else if (prop === "reload") {
          return () => {
            meta.reload();
          };
        } else if (prop === "replace") {
          return (url: string) => {
            meta.replace($optic.scopeURL(url, $optic.scope(meta)));
          };
        } else if (prop === "toString") {
          return () => {
            return $optic.scope(meta).href;
          };
        }

        // @ts-ignore
        if (typeof loc[prop] !== "undefined") {
          // @ts-ignore
          return loc[prop];
        }

        return undefined;
      },
      ownKeys(): ArrayLike<string | symbol> {
        return Object.keys(meta);
      },
      getOwnPropertyDescriptor(): PropertyDescriptor {
        return {
          enumerable: true,
          configurable: true
        };
      },
      set(t, prop: keyof URL, value: string): boolean {
        const loc = new URL(
          $optic.decode(meta.pathname.substring($optic.config.prefix.length))
        ) as any;

        if (!loc[prop]) {
          return false;
        }

        loc[prop] = value;

        meta.href = $optic.scopeURL(loc.toString(), $optic.scope(meta));

        return true;
      }
    }) as Location;

    backup.set(meta, bk);
  }

  return bk;
}
