import { XMLOpen } from "./network";

export const functionToStringBackup = Object.getOwnPropertyDescriptor(
  Function.prototype,
  "toString"
)?.value;

const functionPrototypeRewrites = new Map<any, any>();
functionPrototypeRewrites.set($optic.location.assign, location.assign);
functionPrototypeRewrites.set($optic.location.reload, location.reload);
functionPrototypeRewrites.set($optic.location.replace, location.replace);
functionPrototypeRewrites.set($optic.location.toString, location.toString);
functionPrototypeRewrites.set($optic.location.reload, location.reload);
functionPrototypeRewrites.set($optic.location.replace, location.replace);
functionPrototypeRewrites.set($optic.postMessage, postMessage);
functionPrototypeRewrites.set(window.XMLHttpRequest.prototype.open, XMLOpen);

Function.prototype.toString = function () {
  if (functionPrototypeRewrites.has(this)) {
    return functionPrototypeRewrites.get(this).toString();
  }
  return functionToStringBackup.call(this);
};
