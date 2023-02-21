import libs from "./libs";
import OpticShared from "~/types/OpticShared";

const shared = {
  libs
};

declare global {
  interface Window {
    _OpticShared: typeof shared;
  }
}

self._OpticShared = shared;

export {};
