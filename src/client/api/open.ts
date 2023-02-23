// @ts-ignore
window.open = new Proxy(window.open, {
  apply(target: Function, _, args: any[]): any {
    if (!args[0] || args[0] === "about:blank") {
      const frame = target.apply(null, args);
      function onLoad() {
        frame.removeEventListener("load", onLoad);

        // TODO: inject client scripts
      }
      frame.addEventListener("load", onLoad);
      return frame;
    }
    args[0] = $optic.scopeURL(args[0], $optic.location);
    return target.apply(null, args);
  }
});
