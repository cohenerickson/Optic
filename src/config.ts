import { Cloak } from "./plugins/Cloak";
import { UserAgent } from "./plugins/UserAgent";
import Config from "./types/Config";

const config: Config = {
  prefix: "/optic/",
  codec: "none",
  logLevel: 3,
  bare: new URL("https://tomp.app/"),
  files: {
    dir: "/optic/",
    config: `optic.config.js`,
    client: `optic.client.js`,
    worker: `optic.worker.js`,
    shared: `optic.shared.js`,
    loader: `optic.loader.js`
  },
  plugins: [
    UserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0"
    ),
    Cloak({})
  ]
};

if ("self" in globalThis) {
  self.__optic$config = config;
}

export default config;
