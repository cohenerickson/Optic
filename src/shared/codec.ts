export type Codec = {
  encode: (str: string) => string;
  decode: (str: string) => string;
};

const none: Codec = {
  encode(str: string): string {
    return str;
  },
  decode(str: string): string {
    return str;
  }
};

const basic: Codec = {
  encode(str: string): string {
    return encodeURIComponent(str);
  },
  decode(str: string): string {
    return decodeURIComponent(str);
  }
};

const base64: Codec = {
  encode(str: string): string {
    return atob(str);
  },
  decode(str: string): string {
    return btoa(str);
  }
};

export const codecs = { none, basic, base64 };

export default {
  encode(str: string) {
    const codec = __optic$config.codec;

    if (typeof codec === "string") {
      return codecs[codec].encode(str);
    } else {
      return codec.encode(str);
    }
  },
  decode(str: string) {
    const codec = __optic$config.codec;

    if (typeof codec === "string") {
      return codecs[codec].decode(str);
    } else {
      return codec.decode(str);
    }
  }
} as Codec;
