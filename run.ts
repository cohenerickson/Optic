import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { context } from "esbuild";
import { clean } from "esbuild-plugin-clean";
import express from "express";
import path from "path";
import config from "~/config";

let start: number;

const ctx = await context({
  entryPoints: {
    [path.parse(config.files.config).name]: "src/config.ts",
    [path.parse(config.files.client).name]: "src/client/index.ts",
    [path.parse(config.files.worker).name]: "src/worker/index.ts",
    [path.parse(config.files.shared).name]: "src/shared/index.ts",
    [path.parse(config.files.loader).name]: "src/loader.ts"
  },
  bundle: true,
  target: "esnext",
  minify: process.env.MODE?.trim() === "production",
  outdir: "dist",
  legalComments: "none",
  plugins: [
    clean({
      patterns: ["./dist/*"]
    }),
    NodeModulesPolyfillPlugin(),
    {
      name: "on-end",
      setup(build) {
        build.onStart(async () => {
          start = Date.now();
          console.log("Building...");
        });
        build.onEnd(() => {
          console.log(`Done in ${Date.now() - start}ms`);
        });
      }
    }
  ]
});

if (process.env.MODE?.trim() === "development") {
  await ctx.watch();

  const app = express();

  app.use(express.static("./public"));
  app.use(config.files.dir, express.static("./dist"));

  app.listen(3000);
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
