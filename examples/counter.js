const React = require("react"),
      ffux  = require("../ffux")


const App = React.createClass({
  render() {
    const {counter, step} = this.props.state
    const {incrementCounter, decrementCounter} = this.props.actions.counter
    const {incrementStep, decrementStep} = this.props.actions.step
    return (
      <div>
        <div>Counter: {counter}, Step: {step}</div>
        <button onClick={incrementCounter}>counter +</button>
        <button onClick={decrementCounter}>counter -</button>
        <br />
        <button onClick={incrementStep}>step +</button>
        <button onClick={decrementStep}>step -</button>
      </div>
    )
  }
})

const {run, pure, impure} = ffux


const Counter = ffux({
  _increment: pure(({state, deps: {step}}) => state + step.state()),

  incrementCounter: impure(({state, self}) => {
    setTimeout(_ => self._increment(), state * 100)
  }),

  decrementCounter: pure(({state, deps: {step}}) => state - step.state())
})

const Step = ffux({
  incrementStep: pure(({state}) => state + 1),
  decrementStep: pure(({state}) => state - 1)
})


;(function() {
  const step    = Step(1)
  const counter = Counter(10, {step})

  run({counter, step}, (model) => {
    React.render(<App {...model} />, document.getElementById("app"))
  })
})()
