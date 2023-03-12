const mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
  mutations.forEach((mutation: MutationRecord) => {
    mutation.addedNodes.forEach((node: Node) => rewriteNode(node));
  });
});

function rewriteNode(node: Node & { rewritten?: boolean }): void {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  if (
    node instanceof HTMLElement &&
    $optic.attribute.hasAttribute.call(node, "optic::internal")
  )
    return;
  if (node.rewritten) return;

  const name = node.nodeName.toLowerCase();
  if (name) {
    const element = node as HTMLElement;
    const style = $optic.attribute.getAttribute.call(element, "style");
    if (style) {
      $optic.attribute.setAttribute.call(element, "optic::style", style);
      $optic.attribute.setAttribute.call(
        element,
        "style",
        $optic.rewriteCSS(style, $optic.location)
      );
    }
  }

  if (name === "a" || name === "area" || name === "base") {
    const a = node as HTMLAnchorElement;
    const href = $optic.attribute.getAttribute.call(a, "href");
    if (href) {
      $optic.attribute.setAttribute.call(a, "optic::href", href);
      $optic.attribute.setAttribute.call(
        a,
        "href",
        $optic.scopeURL(href, $optic.location)
      );
    }
  } else if (name === "script") {
    const script = node as HTMLScriptElement;
    const src = $optic.attribute.getAttribute.call(script, "src");
    if (src) {
      $optic.attribute.setAttribute.call(script, "optic::src", src);
      $optic.attribute.setAttribute.call(
        script,
        "src",
        $optic.scopeURL(src, $optic.location)
      );
    }
    if (script.nonce) {
      $optic.attribute.setAttribute.call(script, "optic::nonce", script.nonce);
      $optic.attribute.removeAttribute.call(script, "nonce");
    }
    if (script.integrity) {
      $optic.attribute.setAttribute.call(
        script,
        "optic::integrity",
        script.integrity
      );
      $optic.attribute.removeAttribute.call(script, "integrity");
    }
    const clone = script.cloneNode() as HTMLScriptElement & {
      rewritten?: boolean;
    };
    if (script.innerHTML) {
      $optic.attribute.setAttribute.call(
        clone,
        "optic::innerHTML",
        script.innerHTML
      );
      // TODO: implement JS rewriting
      clone.innerHTML = script.innerHTML;
    }
    clone.rewritten = true;
    script.parentElement?.replaceChild(clone, script);
  } else if (name === "style") {
    const style = node as HTMLStyleElement;
    if (style.innerHTML) {
      $optic.attribute.setAttribute.call(
        style,
        "optic::innerHTML",
        style.innerHTML
      );
      style.innerHTML = $optic.rewriteCSS(style.innerHTML, $optic.location);
    }
  } else if (name === "link") {
    const link = node as HTMLLinkElement;
    const href = $optic.attribute.getAttribute.call(link, "href");
    if (href) {
      $optic.attribute.setAttribute.call(link, "optic::href", href);
      $optic.attribute.setAttribute.call(
        link,
        "href",
        $optic.scopeURL(href, $optic.location)
      );
    }
    if (link.nonce) {
      $optic.attribute.setAttribute.call(link, "optic::nonce", link.nonce);
      $optic.attribute.removeAttribute.call(link, "nonce");
    }
    if (link.integrity) {
      $optic.attribute.setAttribute.call(
        link,
        "optic::integrity",
        link.integrity
      );
      $optic.attribute.removeAttribute.call(link, "integrity");
    }
  } else if (name === "img" || name === "source") {
    const img = node as HTMLImageElement;
    const src = $optic.attribute.getAttribute.call(img, "src");
    if (src) {
      $optic.attribute.setAttribute.call(
        img,
        "src",
        $optic.scopeURL(src, $optic.location)
      );
      $optic.attribute.setAttribute.call(img, "optic::src", src);
    }
    const srcset = $optic.attribute.getAttribute.call(img, "src");
    if (srcset) {
      $optic.attribute.setAttribute.call(
        img,
        "srcset",
        $optic.rewriteSrcSet(srcset, $optic.location)
      );
      $optic.attribute.setAttribute.call(img, "optic::srcset", srcset);
    }
  } else if (name === "form") {
    const form = node as HTMLFormElement;
    const action = $optic.attribute.getAttribute.call(form, "action");
    if (action) {
      $optic.attribute.setAttribute.call(form, "optic::action", action);
      $optic.attribute.setAttribute.call(
        form,
        "action",
        $optic.scopeURL(action, $optic.location)
      );
    }
  } else if (name === "iframe") {
    const iframe = node as HTMLIFrameElement;
    const src = $optic.attribute.getAttribute.call(iframe, "src");
    if (src) {
      $optic.attribute.setAttribute.call(iframe, "optic::src", src);
      $optic.attribute.setAttribute.call(
        iframe,
        "src",
        $optic.scopeURL(src, $optic.location)
      );
    }
  } else if (name === "meta") {
    const meta = node as HTMLMetaElement;
    const content = $optic.attribute.getAttribute.call(meta, "content");
    const httpEquiv = $optic.attribute.getAttribute.call(meta, "http-equiv");
    if (content && httpEquiv?.toLowerCase() === "refresh") {
      $optic.attribute.setAttribute.call(meta, "optic::content", content);
      $optic.attribute.setAttribute.call(
        meta,
        "content",
        content.replace(/^[0-9]+;\s*url=(.*)/g, (_, url) => {
          return $optic.scopeURL(url, $optic.location);
        })
      );
    }
    // TODO: csp
  } else if (name === "body") {
    const body = node as HTMLBodyElement;
    const background = $optic.attribute.getAttribute.call(body, "background");
    if (background) {
      $optic.attribute.setAttribute.call(body, "optic::background", background);
      $optic.attribute.setAttribute.call(
        body,
        "background",
        $optic.scopeURL(background, $optic.location)
      );
    }
  } else if (
    name === "input" ||
    name === "audio" ||
    name === "embed" ||
    name === "track"
  ) {
    const input = node as HTMLInputElement;
    const src = $optic.attribute.getAttribute.call(input, "src");
    if (src) {
      $optic.attribute.setAttribute.call(
        input,
        "src",
        $optic.scopeURL(src, $optic.location)
      );
      $optic.attribute.setAttribute.call(input, "optic::src", src);
    }
  } else if (name === "object") {
    const object = node as HTMLObjectElement;
    const data = $optic.attribute.getAttribute.call(object, "data");
    if (data) {
      $optic.attribute.setAttribute.call(
        object,
        "data",
        $optic.scopeURL(data, $optic.location)
      );
      $optic.attribute.setAttribute.call(object, "optic::data", data);
    }
  } else if (name === "button") {
    const button = node as HTMLButtonElement;
    const formaction = $optic.attribute.getAttribute.call(button, "formaction");
    if (formaction) {
      $optic.attribute.setAttribute.call(
        button,
        "formaction",
        $optic.scopeURL(formaction, $optic.location)
      );
      $optic.attribute.setAttribute.call(
        button,
        "optic::formaction",
        formaction
      );
    }
  } else if (name === "video") {
    const video = node as HTMLVideoElement;
    const src = $optic.attribute.getAttribute.call(video, "src");
    if (src) {
      $optic.attribute.setAttribute.call(
        video,
        "src",
        $optic.scopeURL(src, $optic.location)
      );
      $optic.attribute.setAttribute.call(video, "optic::src", src);
    }
    const poster = $optic.attribute.getAttribute.call(video, "poster");
    if (poster) {
      $optic.attribute.setAttribute.call(
        video,
        "poster",
        $optic.scopeURL(poster, $optic.location)
      );
      $optic.attribute.setAttribute.call(video, "optic::poster", poster);
    }
  }

  if (node) node.rewritten = true;
}

mutationObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
