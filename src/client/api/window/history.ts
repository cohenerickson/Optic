import scope from "~/client/scope";

function createHistoryProxy(
  func: History["pushState"] | History["replaceState"]
) {
  return new Proxy(func, {
    apply(target: any, thisArg: any, args: any[]) {
      if (args[2]) args[2] = __$optic.rewrite.url(args[2], scope(location));
      return Reflect.apply(target, thisArg, args);
    }
  });
}

history.pushState = createHistoryProxy(history.pushState);
history.replaceState = createHistoryProxy(history.replaceState);
