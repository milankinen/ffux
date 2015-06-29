const React    = require("react"),
      appState = require("./appState"),
      App      = require("./app")

appState(window.INITIAL_STATE).listen(model => {
  React.render(<App {...model} />, document.getElementById("app"))
})
