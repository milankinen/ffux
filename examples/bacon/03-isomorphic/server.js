const express  = require("express"),
      React    = require("react"),
      appState = require("./appState"),
      App      = require("./app")


const app = express()

app.get("/", function (req, res) {
  const filter = req.query.filter || ""
  appState({filter, items: [{text: "tsers"}, {text: "ffux"}]})
    .take(model => {
      res.set("Content-Type", "text/html")
      res.send(`<!docype html>
        <html>
          <head><title>ffux isomorphic example w/ RxJs</title></head>
          <body>
            <div id="app">${React.renderToString(<App {...model} />)}</div>
            <script type="text/javascript">
              window.INITIAL_STATE = ${JSON.stringify(model.state)};
            </script>
            <script type="text/javascript" src="bundle.js"></script>
          </body>
        </html>`)
    })
});

app.get("/bundle.js", function(req, res) {
  res.sendFile("bundle.js", {root: __dirname})
})
app.listen(3000)
