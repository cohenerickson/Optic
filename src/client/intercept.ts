const mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
  mutations.forEach((mutation: MutationRecord) => {
    mutation.addedNodes.forEach((node: Node) => {
      const name = node.nodeName.toLowerCase();
      if (name === "img") {
        const img = node as HTMLImageElement;
        const src = img.getAttribute("src");
        if (src) {
          img.src = $optic.scopeURL(src, $optic.location);
        }
      } else if (name === "a") {
        const a = node as HTMLAnchorElement;
        const href = a.getAttribute("href");
        if (href) {
          a.href = $optic.scopeURL(href, $optic.location);
        }
      }
    });
  });
});

mutationObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
