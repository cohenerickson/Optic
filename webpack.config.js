const path = require("path");

module.exports = {
  entry: {
    worker: "./src/worker/",
    shared: "./src/shared/",
    client: "./src/client/",
    optic: "./src/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js"
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".d.ts"]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public")
    },
    proxy: {
      "/bare/": {
        pathRewrite: { "^/bare/": "" },
        target: "http://localhost:8080",
        ws: true
      }
    },
    compress: true,
    port: 3000
  }
};
