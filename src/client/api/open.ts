// @ts-ignore
window.open = new Proxy(window.open, {
  apply(target: Function, _, args: any[]): any {
    if (!args[0] || args[0] === "about:blank") {
      const frame = target.apply(null, args);
      function onLoad() {
        frame.removeEventListener("load", onLoad);

        appendScript(frame.document.head, {
          url: new URL($optic.shared, location.origin).href
        });
        appendScript(frame.document.head, {
          content: `if(!("$optic"in window))$optic={};$optic.setConfig = \`${$optic.setConfig}\`;Function($optic.setConfig)();`
        });
        appendScript(frame.document.head, {
          url: new URL($optic.client, location.origin).href
        });
      }
      frame.addEventListener("load", onLoad);
      return frame;
    }
    args[0] = $optic.scopeURL(args[0], $optic.location);
    return target.apply(null, args);
  }
});

function appendScript(scope: HTMLElement, options: any): void {
  const script = scope.ownerDocument.createElement("script");
  $optic.attribute.setAttribute.call(script, "optic::internal", "true");
  const cache = $optic.disableCache
    ? Math.floor(Math.random() * 900000) + 100000
    : 0;
  if (options.url)
    script.src = `${options.url}${
      $optic.disableCache ? `?cache=${cache}` : ""
    }`;
  if (options.content) script.innerHTML = options.content;
  scope.appendChild(script);
}
