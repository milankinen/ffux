const React = require("react"),
      App   = require("./app")

React.render(<App initialState={window.INITIAL_STATE} />, document.getElementById("app"))
