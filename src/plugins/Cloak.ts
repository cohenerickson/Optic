import { Plugin } from "~/types/Plugin";

type Options = {
  title?: string;
  icon?: string;
};

export function Cloak(options: Options): Plugin {
  return {
    name: "Cloak",
    client() {
      if (options.title) document.title = options.title;
    }
  };
}
