const webpack          = require("webpack"),
      WebpackDevServer = require("webpack-dev-server"),
      webpackConfig    = require("./webpack.config")


new WebpackDevServer(webpack(webpackConfig), { publicPath: "/static/",  hot: true, historyApiFallback: true })
  .listen(3000, "localhost", (err) => {
    if (err) console.log(err)
    console.log("Webpack listening at localhost:3000");
  })


