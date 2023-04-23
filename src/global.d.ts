import BareClient from "@tomphttp/bare-client";
import type { openDB } from "idb";

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

export interface OpticAttributes {
  getAttribute: (attName: string) => string | null;
  setAttribute: (attName: string, value: string) => void;
  hasAttribute: (attName: string) => string | null;
  removeAttribute: (attName: string) => void;
  getAttributeNode: (attName: string) => Attr | null;
  setAttributeNode: (att: Attr) => void;
  removeAttributeNode: (att: Attr) => void;
  getAttributeNames: () => string[];
}

export default interface Optic {
  config: {
    prefix: string;
    bare: string;
    client: string;
    worker: string;
    shared: string;
    disableCache: boolean;
    logLevel: number;
  };
  encode: (url: string) => string;
  decode: (encodedURL: string) => string;
  libs: {
    BareClient: typeof BareClient;
    openDB: typeof openDB;
  };
  scopeURL: (url: string, meta: URL | Location) => string;
  rewriteSrcSet: (url: string, meta: URL | Location) => string;
  rewriteCSS: (url: string, meta: URL | Location) => string;
  rewriteJS: (url: string, meta: URL | Location) => string;
  scope: <T>(x: T) => T;
  // postMessage: (
  //   destination: Window,
  //   data: any,
  //   origin: string,
  //   transfer?: Transferable[]
  // ) => void;
  attribute: OpticAttributes;
}

declare global {
  var $optic: Optic;
  var _$o: <T>(x: T) => T;
}
