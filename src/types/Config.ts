import { Plugin } from "./Plugin";
import { Codec, codecs } from "~/shared/codec";

type PathString = `/${string}/` | "/";
type FileString = `${string}.js`;

type Config = {
  /** Absolute service worker prefix */
  prefix: PathString;
  /** Encoding algorithm to prevent URL detection */
  codec: keyof typeof codecs | Codec;
  /** 0 -> none
   *
   * 1 -> errors
   *
   * 2 -> warnings
   *
   * 3 -> info */
  logLevel: 0 | 1 | 2 | 3;
  /** Bare server URL */
  bare: string | URL;
  files: {
    /** Absolute path to public directory containing files */
    dir: PathString;
    /** Name of config bundle */
    config: FileString;
    /** Name of client bundle */
    client: FileString;
    /** Name of worker bundle */
    worker: FileString;
    /** Name of shared bundle */
    shared: FileString;
    /** Name of loader bundle */
    loader: FileString;
  };
  /** */
  plugins?: Plugin[];
};

export default Config;
