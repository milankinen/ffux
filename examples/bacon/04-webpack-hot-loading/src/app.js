const React      = require("react"),
      {Listener} = require("ffux/react"),
      appState   = require("./appState"),
      Todos      = require("./todos")

export default React.createClass({
  render() {
    return (
      <Listener initialState={{items: [], filter: ""}}
                dispatcher={appState}>
        <Todos />
      </Listener>
    )
  }
})
