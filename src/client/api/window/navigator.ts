import scope from "~/client/scope";

Object.defineProperty(navigator, "serviceWorker", {
  get() {
    return undefined;
  }
});

Object.defineProperty(Navigator.prototype, "serviceWorker", {
  get() {
    return undefined;
  }
});

navigator.sendBeacon = new Proxy(navigator.sendBeacon, {
  apply(target, thisArg, args) {
    if (args[0]) args[0] = __$optic.rewrite.url(args[0], scope(location));
    return Reflect.apply(target, thisArg, args);
  }
});
