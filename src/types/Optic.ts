export interface OpticLocation extends URL {
  ancestorOrigins: { length: number };
  assign: (url: string) => void;
  reload: () => void;
  replace: (url: string) => void;
  toString: () => string;
  valueOf: () => OpticLocation;
  [Symbol.toStringTag]: "Location";
}

export interface OpticStorage {
  getItem: (key: string) => string;
  setItem: (key: string) => string;
  removeItem: (key: string) => void;
  key: (index: number) => string;
  clear: () => void;
  length: number;
  constructor: typeof Storage;
  [Symbol.toStringTag]: "Storage";
}

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
  localStorage: OpticStorage;
  sessionStorage: OpticStorage;
  postMessage: (
    destination: Window,
    data: any,
    origin: string,
    transfer?: Transferable[]
  ) => void;
}
