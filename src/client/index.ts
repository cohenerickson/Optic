import createWindowProxy from "./api/window";
import createLocationProxy from "./api/location";
import createStorageProxy from "./api/storage";
import "./api/network";
import "./api/navigator";
import "./api/open";
import "./api/history";
import "./api/element";
import "./mutation";

const scopes = [window, parent, top];
function isInstanceOf(value: any, type: string): boolean {
  for (const scope of scopes) {
    // @ts-ignore
    if (scope && value instanceof scope[type]) {
      return true;
    }
  }
  return false;
}

$optic.scope = function (value: any): any {
  if (isInstanceOf(value, "Window")) {
    return createWindowProxy(value);
  } else if (isInstanceOf(value, "Location")) {
    return createLocationProxy(value);
  } else if (isInstanceOf(value, "Storage")) {
    return createStorageProxy(value);
  }
  return value;
};
