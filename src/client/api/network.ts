// @ts-ignore
window.fetch = new Proxy(window.fetch, {
  get(target: Function, prop: keyof Function) {
    if (prop === "toString") {
      return () => "function fetch() { [native code] }";
    }
    return target[prop];
  },
  apply(target: Function, _, args: any[]): any {
    if (args[0]) args[0] = $optic.scopeURL(args[0], $optic.location);
    return target.apply(null, args);
  }
});

export const constructRequest = Request;
// @ts-ignore
window.Request = new Proxy(window.Request, {
  construct(target: Function, args: any[]): any {
    const loc = args[0];
    if (args[0]) args[0] = $optic.scopeURL(args[0], $optic.location);
    return new Proxy(Reflect.construct(target, args), {
      get(target: Request, prop: keyof Request): any {
        if (prop === "url") {
          return new URL(loc, $optic.location).href;
        }
        return target[prop];
      }
    });
  }
});

export const XMLOpen = window.XMLHttpRequest.prototype.open;
// @ts-ignore
window.XMLHttpRequest.prototype.open = function (
  method,
  url,
  async,
  user,
  password
) {
  if (url) url = $optic.scopeURL(url.toString(), $optic.location);
  return XMLOpen.call(this, method, url, async, user, password);
};
