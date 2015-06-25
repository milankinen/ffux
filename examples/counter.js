const React = require("react"),
      ffux  = require("../ffux")

const {createStore} = ffux

const Counter = createStore({
  actions: ['increment', 'decrement'],
  state: ({counter}, {increment, decrement}) => {
    return increment
      .merge(decrement.map(d => -d))
      .scan(counter, (state, delta) => state + delta)
  }
})

const App = React.createClass({
  render() {
    // passed model contains two properties:
    //   * "state" contains the current state of the application
    //   * "actions" contains the actions that can be performed
    const {counter} = this.props.state

    // actions are just functions that can be called with arguments normally
    const {increment, decrement} = this.props.actions

    return (
      <div>
        <div>Counter: {counter}</div>
        <button onClick={() => increment(2)}>+2</button>
        <button onClick={() => decrement(1)}>-</button>
      </div>
    )
  }
})

ffux({counter: Counter()}, {counter: 10})
  .listen((model) => {
    React.render(<App {...model} />, document.getElementById("app"))
  })
