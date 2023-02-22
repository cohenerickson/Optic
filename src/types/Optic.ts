import OpticLocation from "./OpticLocation";

export default interface Optic {
  prefix: string;
  bare: string;
  client: string;
  worker: string;
  shared: string;
  disableCache: boolean;
  logLevel: number;
  encode: (url: string) => string;
  decode: (encodedURL: string) => string;
  libs: {
    [key: string]: any;
  };
  scopeURL: (url: string, meta: URL) => string;
  rewriteCSS: (url: string, meta: URL) => string;
  location: OpticLocation;
}
