import BareClient from "@tomphttp/bare-client";
import { encode, decode } from "./codec";
import scopeURL from "./scopeURL";
import rewriteCSS from "./rewriteCSS";
import rewriteSrcSet from "./rewriteSrcSet";
import rewriteJS from "./rewriteJS";
import { openDB } from "idb";

self.$optic = self.$optic || {};
self.$optic = Object.assign(self.$optic, {
  libs: {
    BareClient,
    openDB
  },
  encode,
  decode,
  scopeURL,
  rewriteCSS,
  rewriteJS,
  rewriteSrcSet
});
