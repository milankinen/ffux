const React = require("react"),
      ffux  = require("../ffux")


const App = React.createClass({
  render() {
    const {counter} = this.props.state
    const {increment, decrement} = this.props.actions.counter
    return (
      <div>
        <div>Counter: {counter}</div>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
      </div>
    )
  }
})

const Counter = ffux({
  actions: {
    increment: (state, _) => state + 1,
    decrement: (state, _) => state - 1
  }
})


ffux.run({counter: Counter(0)}, (model) => {
  React.render(<App {...model} />, document.getElementById("app"))
})
