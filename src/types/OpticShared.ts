import BareClient from "@tomphttp/bare-client";

export default interface OpticShared {
  libs: {
    BareClient: typeof BareClient;
  };
}
