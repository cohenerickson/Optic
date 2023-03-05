window.eval = new Proxy(eval, {
  apply (target: any, thisArg: any, args: string[]) {
    if (args[0]) args[0] = $optic.rewriteJS(args[0], $optic.location);
    return Reflect.apply(target, thisArg, args);
  }
});
