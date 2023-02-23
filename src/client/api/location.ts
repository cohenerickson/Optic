import { OpticLocation } from "~/types/Optic";

$optic.location = new Proxy(Object.setPrototypeOf({}, Location.prototype), {
  get(t, prop: string | symbol): any {
    const loc = new URL(
      $optic.decode(location.pathname.substring($optic.prefix.length))
    ) as any;

    if (prop === "constructor") {
      return Location;
    } else if (prop === Symbol.toStringTag) {
      return "Location";
    } else if (prop === "assign") {
      return (url: string) => {
        location.assign($optic.scopeURL(url, $optic.location));
      };
    } else if (prop === "reload") {
      return () => {
        location.reload();
      };
    } else if (prop === "replace") {
      return (url: string) => {
        location.replace($optic.scopeURL(url, $optic.location));
      };
    } else if (prop === "toString") {
      return () => {
        return $optic.location.href;
      };
    } else if (prop === "valueOf") {
      return () => {
        return $optic.location;
      };
    }

    if (loc[prop]) {
      return loc[prop];
    }

    return undefined;
  },
  ownKeys(): ArrayLike<string | symbol> {
    return Object.keys(location);
  },
  getOwnPropertyDescriptor(): PropertyDescriptor {
    return {
      enumerable: true,
      configurable: true
    };
  },
  set(t, prop: keyof URL, value: string): boolean {
    const loc = new URL(
      $optic.decode(location.pathname.substring($optic.prefix.length))
    ) as any;

    if (!loc[prop]) {
      return false;
    }

    loc[prop] = value;

    location.href = $optic.scopeURL(loc.toString(), $optic.location);

    return true;
  }
});
