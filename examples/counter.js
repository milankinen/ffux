const React = require("react"),
      ffux  = require("../ffux")

const {createStore, pure, impure} = ffux


const Counter = createStore({
  actions: {
    // pure actions are *synchronous* functions ({state}, ...action args) -> new state
    // and the store's state can be modified ONLY by using these pure actions
    increment: pure(({state}, step) => state + step),

    decrement: pure(({state}, step) => state - step),

    reset: pure(({state}) => 0),

    // impure actions can't change state but they can call pure actions
    // by using "self" reference. thus you can do sync/async/whatever
    // you want in impure actions: these are the place to e.g. send data
    // to the backend server
    resetAsync: impure(({state, self}) => {
      setTimeout(self.reset, 1000)
    })
  }
})

window.onload = function() {
  // we can create store and set initial state to it and then
  // construct our ffux dispacher by using the template object
  ffux({counter: Counter(10)}).dispatch((model) => {
    React.render(<App {...model} />, document.getElementById("app"))
  })
}

const App = React.createClass({
  render() {
    // passed model contains two properties:
    //   * "state" contains the current state of the application
    //   * "actions" contains the actions that can be performed
    // both "state" and "actions" contain the same keys that were
    // used in "ffux(...)" construction
    const {counter} = this.props.state

    // actions are just functions that can be called with arguments normally
    const {increment, decrement, resetAsync} = this.props.actions.counter

    return (
      <div>
        <div>Counter: {counter}</div>
        {/* use step = 2 for incrementing, step = 1 for decrementing */}
        <button onClick={() => increment(2)}>+</button>
        <button onClick={() => decrement(1)}>-</button>
        <button onClick={() => resetAsync()}>reset</button>
      </div>
    )
  }
})
