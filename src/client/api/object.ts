const objectPrototypeRewrites = new Map<any, any>();
objectPrototypeRewrites.set($optic.localStorage, localStorage);
objectPrototypeRewrites.set($optic.sessionStorage, sessionStorage);

const objectToStringBackup = Object.getOwnPropertyDescriptor(
  Object.prototype,
  "toString"
)?.value;
Object.prototype.toString = function () {
  if (objectPrototypeRewrites.has(this)) {
    return objectPrototypeRewrites.get(this).toString();
  }
  return objectToStringBackup.call(this);
};
