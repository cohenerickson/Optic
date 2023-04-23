// @ts-ignore
window.open = new Proxy(window.open, {
  apply(target: Function, _, args: any[]): any {
    if (!args[0] || args[0] === "about:blank") {
      const frame = target.apply(null, args);
      function onLoad() {
        frame.removeEventListener("load", onLoad);

        appendScript(frame.document.head, {
          url: new URL($optic.config.shared, location.origin).href
        });
        appendScript(frame.document.head, {
          content: `if(!("$optic"in window))$optic={};$optic.config=${JSON.stringify(
            $optic.config
          )};`
        });
        appendScript(frame.document.head, {
          url: new URL($optic.config.client, location.origin).href
        });
      }
      frame.addEventListener("load", onLoad);
      return frame;
    }
    args[0] = $optic.scopeURL(args[0], $optic.scope(location));
    return target.apply(null, args);

    function appendScript(scope: HTMLElement, options: any): void {
      const script = scope.ownerDocument.createElement("script");
      $optic.attribute.setAttribute.call(script, "optic::internal", "true");
      const cache = $optic.config.disableCache
        ? Math.floor(Math.random() * 900000) + 100000
        : 0;
      if (options.url)
        script.src = `${options.url}${
          $optic.config.disableCache ? `?cache=${cache}` : ""
        }`;
      if (options.content) script.innerHTML = options.content;
      scope.appendChild(script);
    }
  }
});
