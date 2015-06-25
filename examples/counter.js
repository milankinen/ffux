const React = require("react"),
      ffux  = require("../ffux")

const {createStore} = ffux

const Counter = createStore({
  actions: ['incrementN', 'decrementOne'],
  state: (initialState, actionStreams) => {
    const {counter} = initialState
    const {incrementN, decrementOne} = actionStreams
    // All Bacon.js tricks are permitted here!
    return incrementN
      .merge(decrementOne.map(-1))
      .scan(counter, (state, delta) => state + delta)
  }
})

const App = React.createClass({
  render() {
    // ffux model contains two properties:
    //   * "state" contains the current state of the application
    //   * "actions" contains the actions that can be performed
    const {counter} = this.props.state

    // actions are just functions that can be called with arguments normally
    const {incrementN, decrementOne} = this.props.actions

    return (
      <div>
        <div>Counter: {counter}</div>
        <button onClick={() => incrementN(2)}>+2</button>
        <button onClick={() => decrementOne()}>-</button>
      </div>
    )
  }
})

const initialState = {counter: 10}
const stateModel   = {counter: Counter()}
const dispatcher   = ffux(stateModel, initialState)

// let's rock
dispatcher.listen((model) => {
  React.render(<App {...model} />, document.getElementById("app"))
})
