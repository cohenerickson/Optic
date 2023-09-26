import api from "./api";
import { globals } from "~/util/globals";

let scopes = [window, parent, top] as (Window & typeof globalThis)[];

function isInstanceOf(
  value: any,
  type: keyof (Window & typeof globalThis)
): boolean {
  const frames = [window.frames].flat(1) as (Window & typeof globalThis)[];

  for (const scope of scopes.concat(frames)) {
    if (scope && value && scope[type] && value instanceof scope[type]) {
      return true;
    } else if (
      scope &&
      value &&
      value[Symbol.toStringTag] &&
      value.constructor &&
      /^function [A-Z][a-z]+\(\)\s?{\s*\[native code\]\s*}$/.test(
        value.constructor.toString()
      ) &&
      value[Symbol.toStringTag] === type
    ) {
      return true;
    }
  }

  return false;
}

function isEqual(value: any, key: string): boolean {
  const frames = [window.frames].flat(1) as (Window & typeof globalThis)[];

  for (const scope of scopes.concat(frames)) {
    if (
      scope &&
      value &&
      value === scope[key as keyof (Window & typeof globalThis)]
    ) {
      return true;
    }
  }

  return false;
}

function scope(value: any): any {
  if (globals.map((x) => isEqual(value, x)).includes(true)) {
    return undefined;
  }

  if (isInstanceOf(value, "Location")) {
    return api.window.location(value as Location);
  }

  if (isInstanceOf(value, "Window")) {
    return api.window.window(value as Window & typeof globalThis);
  }

  if (isInstanceOf(value, "Storage")) {
    return api.window.storage(value as Storage);
  }

  return value;
}

self.__$scope = scope;

export default scope;
