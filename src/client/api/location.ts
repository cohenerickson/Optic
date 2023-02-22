import OpticLocation from "~/types/OpticLocation";

$optic.location = new Proxy(Object.setPrototypeOf({}, Location.prototype), {
  get(target: OpticLocation, prop) {
    const loc = new URL(
      $optic.decode(location.pathname.substring($optic.prefix.length))
    ) as any;

    if (prop === "constructor") {
      return Location;
    }

    if (loc[prop]) {
      return loc[prop];
    }

    if (prop === "assign") {
      return (url: string) => {
        location.assign($optic.scopeURL(url, target));
      };
    } else if (prop === "reload") {
      return () => {
        location.reload();
      };
    } else if (prop === "replace") {
      return (url: string) => {
        location.replace($optic.scopeURL(url, target));
      };
    } else if (prop === "toString") {
      return () => {
        return target.href;
      };
    } else if (prop === "valueOf") {
      return () => {
        return target;
      };
    }

    return undefined;
  },
  set(target: OpticLocation, prop: keyof URL, value: string) {
    return true;
  }
});
