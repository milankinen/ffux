const React      = require("react"),
  {Listener} = require("ffux/react"),
  appState   = require("./appState"),
  TodosApp   = require("./todosApp")

export default React.createClass({
  render() {
    return (
      <Listener initialState={this.props.initialState}
                dispatcher={appState}>
        <TodosApp />
      </Listener>
    )
  }
})
