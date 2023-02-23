const ATTRIBUTE_FUNCTIONS = [
  "getAttribute",
  "setAttribute",
  "hasAttribute",
  "removeAttribute",
  "getAttributeNode",
  "setAttributeNode",
  "removeAttributeNode",
  "getAttributeNames"
] as const;

const ATTRIBUTE_REWRITES = {
  href: [HTMLAnchorElement, HTMLLinkElement, HTMLAreaElement, HTMLBaseElement],
  src: [
    HTMLAudioElement,
    HTMLEmbedElement,
    HTMLIFrameElement,
    HTMLImageElement,
    HTMLInputElement,
    HTMLScriptElement,
    HTMLSourceElement,
    HTMLTrackElement,
    HTMLVideoElement
  ],
  srcset: [HTMLImageElement, HTMLSourceElement],
  action: [HTMLFormElement],
  poster: [HTMLVideoElement],
  formaction: [HTMLButtonElement],
  data: [HTMLObjectElement],
  background: [HTMLBodyElement],
  integrity: [HTMLScriptElement, HTMLLinkElement],
  nonce: [HTMLElement]
} as const;

$optic.attribute = Object.fromEntries(
  ATTRIBUTE_FUNCTIONS.map(
    (
      ATTRIBUTE_FUNCTION
    ): [typeof ATTRIBUTE_FUNCTION, PropertyDescriptor["value"]] => {
      return [
        ATTRIBUTE_FUNCTION,
        Object.getOwnPropertyDescriptor(Element.prototype, ATTRIBUTE_FUNCTION)
          ?.value
      ];
    }
  )
) as {
  [key in typeof ATTRIBUTE_FUNCTIONS[number]]: PropertyDescriptor["value"];
};

Object.defineProperties(Element.prototype, {
  getAttribute: {
    value: function (attribute: string) {
      if (/^_?optic::/.test(attribute)) {
        return $optic.attribute.getAttribute.call(this, `_${attribute}`);
      } else if (
        attribute !== "internal" &&
        $optic.attribute.hasAttribute.call(this, `optic::${attribute}`)
      ) {
        return $optic.attribute.getAttribute.call(this, `optic::${attribute}`);
      }
      return $optic.attribute.getAttribute.call(this, attribute);
    }
  },
  setAttribute: {
    value: function (attribute: string, value: string) {
      if (attribute.startsWith("on")) {
        // TODO: implement JS rewriting
        return $optic.attribute.setAttribute.call(
          this,
          attribute,
          $optic.rewriteJS(value, $optic.location)
        );
      } else if (/^_?optic::/.test(attribute)) {
        return $optic.attribute.setAttribute.call(this, `_${attribute}`, value);
      }
      return $optic.attribute.setAttribute.call(this, attribute, value);
    }
  },
  hasAttribute: {
    value: function (attribute: string) {
      if (/^_?optic::/.test(attribute)) {
        return $optic.attribute.hasAttribute.call(this, `_${attribute}`);
      } else if (
        attribute !== "internal" &&
        $optic.attribute.hasAttribute.call(this, `optic::${attribute}`)
      ) {
        return true;
      } else {
        return $optic.attribute.hasAttribute.call(this, attribute);
      }
    }
  },
  removeAttribute: {
    value: function (attribute: string) {
      if (/^_?optic::/.test(attribute)) {
        return $optic.attribute.removeAttribute.call(this, `_${attribute}`);
      } else if (
        attribute !== "internal" &&
        $optic.attribute.hasAttribute.call(this, `optic::${attribute}`)
      ) {
        return $optic.attribute.removeAttribute.call(
          this,
          `optic::${attribute}`
        );
      }
      return $optic.attribute.removeAttribute.call(this, attribute);
    }
  },
  getAttributeNode: {
    value: function (attribute: string) {
      if (/^_?optic::/.test(attribute)) {
        return $optic.attribute.getAttributeNode.call(this, `_${attribute}`);
      } else if (
        attribute !== "internal" &&
        $optic.attribute.hasAttribute.call(this, `optic::${attribute}`)
      ) {
        const attr = $optic.attribute.getAttributeNode.call(
          this,
          `optic::${attribute}`
        );
        if (!attr) return null;
        return new Proxy(attr, {
          get: function (target, prop: keyof Attr) {
            if (["name", "localName", "nodeName"].includes(prop)) {
              return target.name.replace(/^optic::/, "");
            }
            return target[prop];
          }
        });
      }
      return $optic.attribute.getAttributeNode.call(this, attribute);
    }
  },
  setAttributeNode: {
    value: function (attribute: Attr) {
      if (/^on[a-z]+/i.test(attribute.name)) {
        // TODO: implement JS rewriting
        return $optic.attribute.setAttribute.call(
          this,
          attribute.name,
          $optic.rewriteJS(attribute.value, $optic.location)
        );
      } else if (/^_?optic::/.test(attribute.name)) {
        return $optic.attribute.setAttribute.call(
          this,
          `_${attribute}`,
          attribute.value
        );
      }
      return $optic.attribute.setAttributeNode.call(this, attribute);
    }
  },
  removeAttributeNode: {
    value: function (attribute: Attr) {
      if (/^_?optic::/.test(attribute.name)) {
        return $optic.attribute.removeAttribute.call(
          this,
          `_${attribute.name}`
        );
      } else if (
        attribute.name !== "internal" &&
        $optic.attribute.hasAttribute.call(this, `optic::${attribute.name}`)
      ) {
        $optic.attribute.removeAttribute.call(this, attribute.name);
        return $optic.attribute.removeAttribute.call(
          this,
          `optic::${attribute.name}`
        );
      }
      return $optic.attribute.removeAttributeNode.call(this, attribute);
    }
  },
  getAttributeNames: {
    value: function () {
      let attributes = $optic.attribute.getAttributeNames.call(this);
      attributes.filter((attribute) => !/^optic::internal$/.test(attribute));
      attributes = attributes.map((attribute) => {
        if (/^_?optic::/.test(attribute)) {
          return attribute.replace(/^_?optic::/, "");
        }
        return attribute;
      });
      return Array.from(new Set(attributes));
    }
  }
});

ATTRIBUTE_FUNCTIONS.forEach((ATTRIBUTE_FUNCTION) => {
  Element.prototype[ATTRIBUTE_FUNCTION].prototype.toString = (): string =>
    `function ${ATTRIBUTE_FUNCTION}() { [native code] }`;
});

Object.entries(ATTRIBUTE_REWRITES).forEach(([property, elements]) => {
  elements.forEach((element: typeof HTMLElement) => {
    const { get, set } =
      Object.getOwnPropertyDescriptor(element.prototype, property) ?? {};
    if (!get || !set) return;
    Object.defineProperty(element.prototype, property, {
      get() {
        if (property === "href" || property === "src") {
          return new URL(this.getAttribute(property), $optic.location).href;
        }
        return get.call(this);
      },
      set(value) {
        if (property === "href" || property === "src") {
          $optic.attribute.setAttribute.call(this, `optic::${property}`, value);
          return this.setAttribute(
            property,
            $optic.scopeURL(value, $optic.location)
          );
        } else if (property === "nonce" || property === "integrity") {
          return $optic.attribute.setAttribute.call(
            this,
            `optic::${property}`,
            value
          );
        }
        return set.call(this, value);
      }
    });
  });
});
