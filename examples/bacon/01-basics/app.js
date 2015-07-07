const React = require("react"),
      ffux  = require("ffux")

const {Listener} = require("ffux/react")
const {createStore} = ffux

const Counter = createStore({
  actions: ["incrementN", "decrementOne"],
  state: (initialState, actionStreams) => {
    const {incrementN, decrementOne} = actionStreams
    // All Bacon.js tricks are permitted here!
    return incrementN
      .merge(decrementOne.map(-1))
      .scan(initialState, (state, delta) => state + delta)
  }
})

const CounterApp = React.createClass({
  render() {
    // ffux model contains two properties:
    //   * "state" contains the current state of the application
    //   * "actions" contains the action creators that can be invoked
    const {counter} = this.props.state

    // action creators are just functions that can be invoked with arguments normally
    const {counter: {incrementN, decrementOne}} = this.props.actions

    return (
      <div>
        <div>Counter: {counter}</div>
        <button onClick={() => incrementN(2)}>+2</button>
        <button onClick={() => decrementOne()}>-</button>
      </div>
    )
  }
})

const App = React.createClass({
  render() {
    return (
      <Listener initialState={{counter: 10}}
                dispatcher={state => ffux({counter: Counter(state.counter)})}>
        <CounterApp />
      </Listener>
    )
  }
})

React.render(<App />, document.getElementById("app"))
