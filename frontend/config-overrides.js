const {
  override,
  addWebpackAlias,
  addWebpackPlugin,
} = require("customize-cra");
const webpack = require("webpack");
const path = require("path");

module.exports = override(
  addWebpackAlias({
    os: require.resolve("os-browserify/browser"),
  }),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    })
  ),
  (config) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        os: require.resolve("os-browserify/browser"),
        process: require.resolve("process/browser.js"),
        buffer: require.resolve("buffer/"),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    };
    return config;
  }
);
