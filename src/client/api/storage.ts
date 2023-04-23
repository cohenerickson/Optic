import type { OpticStorage } from "~/global";

const backup = new Map<Storage, OpticStorage>();

export default function createStorageProxy(scope: Storage): OpticStorage {
  let bk = backup.get(scope);
  if (!bk) {
    bk = new Proxy(Object.setPrototypeOf({}, Storage.prototype), {
      get(t, prop: string | symbol): any {
        const storage = Object.fromEntries(
          Object.entries(scope)
            .filter(([key]) => key.endsWith(`@${$optic.scope(location).host}`))
            .map(([key, value]) => [
              key.slice(0, key.length - $optic.scope(location).host.length - 1),
              value
            ])
        ) as any;

        if (prop === "getItem") {
          return (key: string): string | null => {
            return scope.getItem(`${key}@${$optic.scope(location).host}`);
          };
        } else if (prop === "setItem") {
          return (key: string, value: string): void => {
            return scope.setItem(
              `${key}@${$optic.scope(location).host}`,
              value
            );
          };
        } else if (prop === "removeItem") {
          return (key: string): void => {
            return scope.removeItem(`${key}@${$optic.scope(location).host}`);
          };
        } else if (prop === "key") {
          return (index: number) => {
            return Object.keys(storage)[index];
          };
        } else if (prop === "clear") {
          return (): void => {
            Object.keys(storage).forEach((key) => {
              scope.removeItem(`${key}@${$optic.scope(location).host}`);
            });
          };
        }

        return storage[prop];
      },
      ownKeys(): ArrayLike<string | symbol> {
        return Object.keys(scope)
          .filter((key) => key.endsWith(`@${$optic.scope(location).host}`))
          .map((key) =>
            key.slice(0, key.length - $optic.scope(location).host.length - 1)
          );
      },
      getOwnPropertyDescriptor(): PropertyDescriptor {
        return {
          enumerable: true,
          configurable: true
        };
      },
      set(t, key: string | symbol, value: any): boolean {
        scope.setItem(
          `${key.toString()}@${$optic.scope(location).host}`,
          value
        );
        return true;
      }
    }) as OpticStorage;

    backup.set(scope, bk);
  }

  return bk;
}
