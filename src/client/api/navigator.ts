Object.defineProperty(navigator, "serviceWorker", {
  get() {
    return undefined;
  }
});

navigator.sendBeacon = new Proxy(navigator.sendBeacon, {
  apply(target, thisArg, args) {
    if (args[0]) args[0] = $optic.scopeURL(args[0], $optic.scope(location));
    return Reflect.apply(target, thisArg, args);
  }
});
