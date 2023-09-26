import scope from "~/client/scope";

const getter: () => string = Object.getOwnPropertyDescriptor(
  Response.prototype,
  "url"
)!.get!;

Object.defineProperty(Response.prototype, "url", {
  get() {
    let url = new URL(getter.call(this));

    if (url.host === location.host) {
      url = new URL(url.pathname, scope(location));
    }

    return url.toString();
  }
});
