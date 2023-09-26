import codec from "./codec";
import { css } from "./rewrite/css";
import { html } from "./rewrite/html";
import { js } from "./rewrite/js";
import { srcset } from "./rewrite/srcset";
import { url } from "./rewrite/url";

class Optic {
  codec = codec;
  rewrite = {
    url,
    js,
    css,
    srcset,
    html
  };

  constructor(scope: Window) {}
}

const optic: Optic = new Optic(self);

if ("self" in globalThis) {
  self.__$optic = optic;
}

export default Optic;
