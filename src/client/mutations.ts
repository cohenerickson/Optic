import { attributes } from "./api/window/HTMLElement";
import scope from "./scope";

const mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
  mutations.forEach((mutation: MutationRecord) => {
    rewrite(mutation.target);
    mutation.addedNodes.forEach(rewrite);
  });
});

function rewrite(node: Node) {
  rewriteNode(node);
  if (node.childNodes) node.childNodes.forEach(rewrite);
}

function rewriteNode(node: Node & { rewritten?: boolean }): void {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  if (
    node instanceof HTMLElement &&
    attributes.hasAttribute.call(node, "optic::internal")
  )
    return;
  if (node.rewritten) return;

  const name = node.nodeName.toLowerCase();
  if (name) {
    const element = node as HTMLElement;
    const style = attributes.getAttribute.call(element, "style");
    if (style) {
      attributes.setAttribute.call(element, "optic::style", style);
      attributes.setAttribute.call(
        element,
        "style",
        __$optic.rewrite.css(style, scope(location))
      );
    }
  }

  if (name === "a" || name === "area" || name === "base") {
    const a = node as HTMLAnchorElement;
    const href = attributes.getAttribute.call(a, "href");
    if (href) {
      attributes.setAttribute.call(a, "optic::href", href);
      attributes.setAttribute.call(
        a,
        "href",
        __$optic.rewrite.url(href, scope(location))
      );
    }
  } else if (name === "script") {
    const script = node as HTMLScriptElement;
    const src = attributes.getAttribute.call(script, "src");
    if (src) {
      attributes.setAttribute.call(script, "optic::src", src);
      attributes.setAttribute.call(
        script,
        "src",
        __$optic.rewrite.url(src, scope(location))
      );
    }
    if (script.nonce) {
      attributes.setAttribute.call(script, "optic::nonce", script.nonce);
      attributes.removeAttribute.call(script, "nonce");
    }
    if (script.integrity) {
      attributes.setAttribute.call(
        script,
        "optic::integrity",
        script.integrity
      );
      attributes.removeAttribute.call(script, "integrity");
    }
    const clone = script.cloneNode() as HTMLScriptElement & {
      rewritten?: boolean;
    };
    if (script.innerHTML) {
      attributes.setAttribute.call(clone, "optic::innerHTML", script.innerHTML);
      clone.innerHTML = __$optic.rewrite.js(script.innerHTML, scope(location));
    }
    clone.rewritten = true;
    script.parentElement?.replaceChild(clone, script);
  } else if (name === "style") {
    const style = node as HTMLStyleElement;
    if (style.innerHTML) {
      attributes.setAttribute.call(style, "optic::innerHTML", style.innerHTML);
      style.innerHTML = __$optic.rewrite.css(style.innerHTML, scope(location));
    }
  } else if (name === "link") {
    const link = node as HTMLLinkElement;
    const href = attributes.getAttribute.call(link, "href");
    if (href) {
      attributes.setAttribute.call(link, "optic::href", href);
      attributes.setAttribute.call(
        link,
        "href",
        __$optic.rewrite.url(href, scope(location))
      );
    }
    if (link.nonce) {
      attributes.setAttribute.call(link, "optic::nonce", link.nonce);
      attributes.removeAttribute.call(link, "nonce");
    }
    if (link.integrity) {
      attributes.setAttribute.call(link, "optic::integrity", link.integrity);
      attributes.removeAttribute.call(link, "integrity");
    }
  } else if (name === "img" || name === "source") {
    const img = node as HTMLImageElement;
    const src = attributes.getAttribute.call(img, "src");
    if (src) {
      attributes.setAttribute.call(
        img,
        "src",
        __$optic.rewrite.url(src, scope(location))
      );
      attributes.setAttribute.call(img, "optic::src", src);
    }
    const srcset = attributes.getAttribute.call(img, "src");
    if (srcset) {
      attributes.setAttribute.call(
        img,
        "srcset",
        __$optic.rewrite.srcset(srcset, scope(location))
      );
      attributes.setAttribute.call(img, "optic::srcset", srcset);
    }
  } else if (name === "form") {
    const form = node as HTMLFormElement;
    const action = attributes.getAttribute.call(form, "action");
    if (action) {
      attributes.setAttribute.call(form, "optic::action", action);
      attributes.setAttribute.call(
        form,
        "action",
        __$optic.rewrite.url(action, scope(location))
      );
    }
  } else if (name === "iframe") {
    const iframe = node as HTMLIFrameElement;
    const src = attributes.getAttribute.call(iframe, "src");
    if (src) {
      attributes.setAttribute.call(iframe, "optic::src", src);
      attributes.setAttribute.call(
        iframe,
        "src",
        __$optic.rewrite.url(src, scope(location))
      );
    }
  } else if (name === "meta") {
    const meta = node as HTMLMetaElement;
    const content = attributes.getAttribute.call(meta, "content");
    const httpEquiv = attributes.getAttribute.call(meta, "http-equiv");
    if (content && httpEquiv?.toLowerCase() === "refresh") {
      attributes.setAttribute.call(meta, "optic::content", content);
      attributes.setAttribute.call(
        meta,
        "content",
        content.replace(/^[0-9]+;\s*url=(.*)/g, (_: any, url: string) => {
          return __$optic.rewrite.url(url, scope(location));
        })
      );
    }
    // TODO: csp
  } else if (name === "body") {
    const body = node as HTMLBodyElement;
    const background = attributes.getAttribute.call(body, "background");
    if (background) {
      attributes.setAttribute.call(body, "optic::background", background);
      attributes.setAttribute.call(
        body,
        "background",
        __$optic.rewrite.url(background, scope(location))
      );
    }
  } else if (
    name === "input" ||
    name === "audio" ||
    name === "embed" ||
    name === "track"
  ) {
    const input = node as HTMLInputElement;
    const src = attributes.getAttribute.call(input, "src");
    if (src) {
      attributes.setAttribute.call(
        input,
        "src",
        __$optic.rewrite.url(src, scope(location))
      );
      attributes.setAttribute.call(input, "optic::src", src);
    }
  } else if (name === "object") {
    const object = node as HTMLObjectElement;
    const data = attributes.getAttribute.call(object, "data");
    if (data) {
      attributes.setAttribute.call(
        object,
        "data",
        __$optic.rewrite.url(data, scope(location))
      );
      attributes.setAttribute.call(object, "optic::data", data);
    }
  } else if (name === "button") {
    const button = node as HTMLButtonElement;
    const formaction = attributes.getAttribute.call(button, "formaction");
    if (formaction) {
      attributes.setAttribute.call(
        button,
        "formaction",
        __$optic.rewrite.url(formaction, scope(location))
      );
      attributes.setAttribute.call(button, "optic::formaction", formaction);
    }
  } else if (name === "video") {
    const video = node as HTMLVideoElement;
    const src = attributes.getAttribute.call(video, "src");
    if (src) {
      attributes.setAttribute.call(
        video,
        "src",
        __$optic.rewrite.url(src, scope(location))
      );
      attributes.setAttribute.call(video, "optic::src", src);
    }
    const poster = attributes.getAttribute.call(video, "poster");
    if (poster) {
      attributes.setAttribute.call(
        video,
        "poster",
        __$optic.rewrite.url(poster, scope(location))
      );
      attributes.setAttribute.call(video, "optic::poster", poster);
    }
  }

  if (node) node.rewritten = true;
}

mutationObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
