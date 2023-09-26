import scope from "~/client/scope";

const getter: () => string = Object.getOwnPropertyDescriptor(
  Request.prototype,
  "url"
)!.get!;

Object.defineProperty(Request.prototype, "url", {
  get() {
    let url = new URL(getter.call(this));

    if (url.host === location.host) {
      url = new URL(url.pathname, scope(location));
    }

    return url.toString();
  }
});
