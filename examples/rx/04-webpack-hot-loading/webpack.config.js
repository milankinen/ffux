const path = require("path")

const {HotModuleReplacementPlugin, NoErrorsPlugin} = require("webpack")

export default {
  devtool: "eval",
  entry: [
    "webpack-dev-server/client?http://localhost:3000",
    "webpack/hot/only-dev-server",
    "./src/site.js"
  ],
  output: {
    path: __dirname,
    filename: "bundle.js",
    publicPath: "/static/"
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new NoErrorsPlugin()
  ],
  resolve: {
    extensions: ["", ".js", ".jsx"]
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ["react-hot", "babel"],
      include: path.join(__dirname, "src")
    }]
  }
}
