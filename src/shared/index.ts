import BareClient from "@tomphttp/bare-client";
import { encode, decode } from "./codec";
import scopeURL from "./scopeURL";
import rewriteCSS from "./rewriteCSS";

// @ts-ignore
self.$optic = {
  libs: {
    BareClient
  },
  encode,
  decode,
  scopeURL,
  rewriteCSS
};
