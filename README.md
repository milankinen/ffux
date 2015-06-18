# ffux

Functional and reactive Flux implementation with minimal boilerplate.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/ffux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)


## Motivation

I've tried to bring Functional Reactive Programming into the React scene 
but it seems that the front-end world is not yet ready to accept FRP to 
the main stream. 

Flux is the hottest keyword in the React circles nowadays. Although the 
latest Flux implementation have moved towards functional paradigms
(immutability, monadic state transform) they still introduce a lot of
boilerplate and complexity that could be avoided by adopting reactive
patterns.

The goal of this project is to introduce an alternative way to apply 
Flux - more reactive and functional way that has a huge expressive 
power through `pure` and `impure` actions but still avoiding unnecessary
boilerplate and action/store separation with `reactions`.


## Why to choose ffux?

Here are some points to choose `ffux` over other Flux implementations:

  * **Extremely simple** - Use `createStore`, `pure` and `impure` to construct your whole app logic
  * **No boilerplate** - Your almost every code line is effective
  * **High cohesion** - Actions and stores go hand-to-hand thanks to reactions
  * **Library/view agnostic** - Drop React and use with jQuery if you want ;)
  * **Testable** - Stores are completely independent, thus mocking the endpoints is extremely easy
  * **Hot-reloadble** - Your application state can be re-constructed at any point
  * **Lightweight** - The whole library is under 150 LOC of ES6. No dependencies. Seriously. :)
  
## How to use?

`Store` is the basic (and only) unit in `ffux`. It is just a set of
pure/impure actions and reactions. There are only two rules when creating
the store:

  1) Pure actions are **always** synchronous and only they are allowed to modify the store's state
  2) Impure actions can never modify the state directly but they have no other restrictions 

Let's see what this means in the code:

```javascript
const {createStore, pure, impure} = require("ffux") 

const Counter = createStore({
  actions: {
    increment: pure(({state}, step) => state + step),

    decrement: pure(({state}, step) => state - step),

    reset: pure(({state}) => 0),

    resetAsync: impure(({state, self}) => {
      // note that state is a function in impure actions due to async nature of impure action
      console.log(state())
      setTimeout(() => {
        // pure actions can be called by using `self`
        self.reset()
        console.log(state())
      }, 1000)
    })
  }
})
```

And that's it! You've created your first store. Like in React's `createClass`,
`createStore` does not create an instance yet. This is because you have to give
an initial state to your store:

```javascript
const counter = Counter(10)
counter.state()   // => 10
const {increment} = counter.actions()
// note that action is a normal function that match the action's signature 
// except the first parameter which is assigned by ffux
increment(5)
counter.state()   // => 15
```

Normally you should never need to use `.state()` method in your application. Instead,
you can create a dispatcher by using store instances:

```javascript
const ffux = require("ffux")
const dispatcher = ffux({counterOne: Counter(10), counterTwo: Counter(5)})
dispatcher.listen(({state, actions} => {
  // state   == {counterOne: 10, counterTwo: 5}
  // actions == {counterOne: {increment, decrement, ...}, counterTwo: { ... }}
  React.render(<MyApp state={state} actions={actions} />, ...)
})
``` 

Every time you modify the state by using provided actions, your listener
callback is triggered with the new state. And that state can be passed down
to your views along with the actions. No need to create "smart components".
Never again.

### Putting it all together 

```javascript
const React = require("react"),
      ffux  = require("ffux")

const {createStore, pure, impure} = ffux

const Counter = createStore({
  actions: {
    increment: pure(({state}, step) => state + step),
    decrement: pure(({state}, step) => state - step),
    reset: pure(({state}) => 0),
    resetAsync: impure(({state, self}) => {
      setTimeout(self.reset, 1000)
    })
  }
})

const App = React.createClass({
  render() {
    const {counter} = this.props.state
    const {increment, decrement, resetAsync} = this.props.actions.counter
    return (
      <div>
        <div>Counter: {counter}</div>
        <button onClick={() => increment(2)}>+2</button>
        <button onClick={() => decrement(1)}>-</button>
        <button onClick={() => resetAsync()}>reset</button>
      </div>
    )
  }
})

ffux({counter: Counter(10)}).listen((model) => {
  React.render(<App {...model} />, document.getElementById("app"))
})
```

## License

MIT
