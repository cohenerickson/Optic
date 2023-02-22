export default interface OpticLocation extends URL {
  ancestorOrigins: { length: number };
  assign: (url: string) => void;
  reload: () => void;
  replace: (url: string) => void;
  toString: () => string;
  valueOf: () => OpticLocation;
  "Symbol(Symbol.toPrimitive)": undefined;
  "Symbol(Symbol.toStringTag)": "Location";
}
