import createWindowProxy from "./window";
import scope from "~/client/scope";

self.open = new Proxy(self.open, {
  apply(target, t, args) {
    args[0] = __$optic.rewrite.url(args[0] || "about:blank", scope(location));

    const win = target(...args);

    if (win) {
      return createWindowProxy(win as Window & typeof globalThis);
    } else {
      return win;
    }
  }
});
