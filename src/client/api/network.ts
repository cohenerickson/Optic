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
