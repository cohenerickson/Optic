export const pushState = history.pushState;
export const replaceState = history.replaceState;

history.pushState = new Proxy(history.pushState, {
  apply (target: any, thisArg: any, args: any[]) {
    if (args[2]) args[2] = $optic.scopeURL(args[2], $optic.location);
    return Reflect.apply(target, thisArg, args);
  }
});

history.replaceState = new Proxy(history.replaceState, {
  apply (target: any, thisArg: any, args: any[]) {
    if (args[2]) args[2] = $optic.scopeURL(args[2], $optic.location);
    return Reflect.apply(target, thisArg, args);
  }
});
