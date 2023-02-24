import BareClient from "@tomphttp/bare-client";
import { encode, decode } from "./codec";
import scopeURL from "./scopeURL";
import rewriteCSS from "./rewriteCSS";
import rewriteSrcSet from "./rewriteSrcSet";
import { openDB } from "idb";

// @ts-ignore
self.$optic = {
  libs: {
    BareClient,
    openDB
  },
  encode,
  decode,
  scopeURL,
  rewriteCSS,
  rewriteJS: (x) => {
    return x;
  },
  rewriteSrcSet
};
