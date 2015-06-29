# ffux

Flux implementation for Functional Reactive Programming with 
[Bacon.js](https://github.com/baconjs/bacon.js) or [RxJS](https://github.com/Reactive-Extensions/RxJS). 

[![npm version](https://badge.fury.io/js/ffux.svg)](http://badge.fury.io/js/ffux)
[![Build Status](https://travis-ci.org/milankinen/ffux.svg?branch=master)](https://travis-ci.org/milankinen/ffux)
[![codecov.io](http://codecov.io/github/milankinen/ffux/coverage.svg?branch=master)](http://codecov.io/github/milankinen/ffux?branch=master)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/ffux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)


## Motivation

Flux is the hottest keyword in the React circles nowadays. Although the 
latest Flux implementations have moved towards functional paradigms they 
still introduce a lot of boilerplate, complexity and potential bugs that 
could be avoided by adopting Functional Reactive Programming.

The goal of this project is to remove all of the complexity and
provide a simple way to harness the power of FRP by using the mental 
model of Flux.


## Why to choose ffux?

Here are some points to choose `ffux` over other Flux implementations:

  * **Expressive** - All the power of FRP is on your hand
  * **Extremely simple** - Only two functions needed: `createStore` and `ffux`
  * **Library/view agnostic** - Drop React and use with jQuery if you want ;-)
  * **Explicit** - See the structure of your application with a single glance
  * **Lightweight** - The whole library is under 200 LOC of ES6. :-)

Well... You must see it yourself:

```javascript 
const React = require("react"),
      ffux  = require("ffux")

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

const App = React.createClass({
  render() {
    // ffux model contains two properties:
    //   * "state" contains the current state of the application
    //   * "actions" contains the actions that can be performed (per store)
    const {counter} = this.props.state

    // actions are just functions that can be called with arguments normally
    const {incrementN, decrementOne} = this.props.actions.counter

    return (
      <div>
        <div>Counter: {counter}</div>
        <button onClick={() => incrementN(2)}>+2</button>
        <button onClick={() => decrementOne()}>-</button>
      </div>
    )
  }
})

const stateModel   = {counter: Counter(10)}
const dispatcher   = ffux(stateModel)

// let's rock
dispatcher.listen((model) => {
  React.render(<App {...model} />, document.getElementById("app"))
})
```
  
## How to use?

Install dependencies with npm and start coding. For Bacon.js users:

    npm i --save ffux baconjs
    
For RxJS users:

    npm i --save ffux rx
    
    
## API

`ffux` is designed to be used with ES6 but it can be used with ES5 as well.
In order to to use `fflux` you must require it to your project:

If you are using Bacon.js:
```javascript 
const ffux = require("ffux")
```

If you are using RxJS:
```javascript 
const ffux = require("ffux/rx")
``` 

### `createStore({[actions,] state}) -> StoreFactory`

Creates a new store factory that contains the given actions names and state
initialization function.

* Initial state and store actions (and dependencies) are passed to the state initialization function by `ffux`
* State initialization function must return `Bacon.Property` or `Rx.Observable` with `.startWith(initialState`)

```javascript 
// Bacon.js
const CounterStore = ffux.createStore({
  actions: ["icrement", "resetAsync"],
  // Parameters in state initialization function:
  //  1. initial state
  //  2. action streams of this store (Bacon.EventStreams) mapped behind their names
  //  3. dependencies if any (see below)
  state: (counter, {increment, resetAsync}) => {
    // Here comes all the business logic of the store!
    // You are free to implement the data flow by using whatever FRP means you want
    const resetS   = resetAsync.delay(1000)
    const counterP = Bacon.update(counter,
      [increment], (state, delta) => state + delta,
      [resetS],    _ => 0
    )
    // the only restriction of the store is that it must return Bacon.property
    return counterP
  }
})

// RxJS
const CounterStore = ffux.createStore({
  actions: ["icrement", "resetAsync"],
  // same parameters as Bacon.js
  state: (counter, {increment, resetAsync}) => {
    const resetS   = resetAsync.delay(1000)
    // ffux contains similar function to Bacon.update for RxJs users
    // to ease store's state handling 
    return ffux.update(counter,
      increment, (state, delta) => state + delta,
      resetS,    _ => 0
    )
  }
```

Actions can take either zero, one or many parameters. When creating actions
with zero or one parameter then that parameter is passed to the state stream
as it is:

```javascript
const Filter = ffux.createStore({
  actions: ["resetFilter"],
  state: (initialState, {resetFilter}) => {
    const trimmed = resetFilter.map(value => value.trim())
    ...
  }
})
// and usage inside your app
resetFilter("tsers")
```

Because event streams emit single events, multiple parameters are converted
into an array that is passed to the event stream:

```javascript
const Filter = ffux.createStore({
  actions: ["resetFilter"],
  state: (initialState, {resetFilter}) => {
    const trimmedAsync = resetFilter.flatMap(([value, timeout]) => Bacon.later(timeout, value.trim()))
    ...
  })
})
// and usage inside your app
resetFilter("tsers", 1000)
```

### Instantiation of stores

Store instances can be created by using the `StoreFactory` function. It takes
the store's initial state and optional dependencies (see below).

```javascript 
const counter = Counter(10)
```
### `ffux(stateModel) -> Dispatcher`

Once you've created your stores, you can create a dispatcher instance by using
the stores. Dispatcher takes one arguments:

1. State model which is a plain object of stores instances. *This state model should reflect your (initial) state*

Dispacher has one method: `.listen(callback)`. It can be used to listen your
state changes. When the application state changes, `{state, actions}` object 
containing the current state (schema reflects the state model) and actions 
is passed to the callback function.

This is the place to render your UI:

```javascript
const dispatcher = ffux({counter})
dispatcher.listen(({state, actions}) => {
  // state == {counter: 10}
  // actions == {counter: {increment: Function(int), resetAsync: Function()}}
  React.render(<MyApp state={state} actions={actions} />, ...)
})
```

#### Flattening actions

By default, actions are passed using the same schema as the state model. However,
you can flatten them into `actions` object by passing `flatActions = true` option
to the dispatcher. In that case remember that if action names clashes, an error
is thrown during dispatcher initialization:

```javascript
const dispatcher = ffux({counter, filter}, {flatActions: true})
dispatcher.listen(({state, actions}) => {
  // actions == {increment: Function(int), resetAsync: Function(), resetFilter: Function(string)}
  React.render(<MyApp state={state} actions={actions} />, ...)
})
```

### Declaring dependencies between stores

In complex applications, dependencies are inevitable. Normal Flux implementations
use signals and publish-subscribe to resolve this. This method provides extremely
loose coupling but it has a major drawback: when dependencies become more complex, 
their management becomes chaotic and unpredictable because causations are not
visible, thus there are high possibility to introduce e.g. cyclic dependencies.

`ffux` takes another approach: dependencies between stores are declared explicitly.
This ensures you to think about responsibilities of your stores and reduce the
possibility of circular dependencies and such kind of bugs.

In `ffux` you can declare dependencies during the store instantiation by passing
the dependencies as a second parameter to the store. Then these dependencies are
available in the store's state initialization:

```javascript 
const Todos = createStore({
  // dependencies are available via the 3rd parameter. they are the state
  // streams of the stores and can be used like any other EventStream
  state: (items, {}, {filter}) => {
    return Bacon.combineTemplate({items, filter})
      .map(({items, filter}) => items.indexOf(filter) !== -1)
  }
})

const filter = Filter("")
const todos  = Todos([], {filter})
ffux({todos, filter}).listen(...)
```

### Isomorphic app development

`ffux` has a native support for isomorphic application development. When you 
have created your `ffux` dispatcher, you can get the initial state with 
`.tak(callback)` method and use the fetched model to render your application
in your server:

```javascript 
// appState.js
export default function appState({filter: initFilter = "", todos: initTodos = []}) {
  const filter = Filter(initFilter)
  const todos  = Todos(initTodos, {filter})
  return ffux({todos, filter})
}
```

In the server:
```javascipt
// server.js
const state = loadFromDB()
appState(state).take(model => {
  res.send(`<html>
              <head></head>
              <body>
                <div id="app">${React.renderToString(<YourApp {...model} />)}</div>
                <script type="text/javascript">
                  window.INITIAL_STATE = ${JSON.stringify(model.state)};
                </script>
                <script type="text/javascript" src="site.js"></script>
              </body>
            </html>`)
})
``` 

And in the browser:
```javascript
// site.js
appState(window.INITIAL_STATE).listen(model => {
  React.render(<YourApp {...model} />, document.getElementById("app"))
})
```

For more information, see isomorphic examples from `examples` folder.

## License

MIT
