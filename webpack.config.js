const webpack = require("webpack");

module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  entry: {
    bundle: `${__dirname}/src/client/render-main.tsx`
  },
  output: {
    filename: "[name].js",
    path: `${__dirname}/public/js`
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.client.json"
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: function() {
                return [
                  require("precss"),
                  require("autoprefixer")
                ];
              }
              /* for future version
              postcssOptions: {
                plugins: [
                  require("precss")({}),
                  require('autoprefixer')({})
                ]
              }
              */
            }
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", "css", "scss"],
    alias: {
      assert: "assert",
      buffer: "buffer",
      console: "console-browserify",
      constants: "constants-browserify",
      crypto: "crypto-browserify",
      domain: "domain-browser",
      events: "events",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify/browser",
      path: "path-browserify",
      punycode: "punycode",
      process: "process/browser",
      querystring: "querystring-es3",
      stream: "stream-browserify",
      _stream_duplex: "readable-stream/duplex",
      _stream_passthrough: "readable-stream/passthrough",
      _stream_readable: "readable-stream/readable",
      _stream_transform: "readable-stream/transform",
      _stream_writable: "readable-stream/writable",
      string_decoder: "string_decoder",
      sys: "util",
      timers: "timers-browserify",
      tty: "tty-browserify",
      url: "url",
      util: "util",
      vm: "vm-browserify",
      zlib: "browserify-zlib"
    },
    fallback: {
      child_process: false,
      fs: false,
      //crypto: false,
      net: false,
      tls: false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser"
    })
  ]
};
