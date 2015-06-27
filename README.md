# ffux

Flux implementation for Functional Reactive Programming with [Bacon.js](https://github.com/baconjs/bacon.js)
and minimal boilerplate. (RxJs support coming soon...)

[![npm version](https://badge.fury.io/js/ffux.svg)](http://badge.fury.io/js/ffux)
[![Build Status](https://travis-ci.org/milankinen/ffux.svg?branch=master)](https://travis-ci.org/milankinen/ffux)
[![codecov.io](http://codecov.io/github/milankinen/ffux/coverage.svg?branch=master)](http://codecov.io/github/milankinen/ffux?branch=master)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/ffux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)


## Motivation

Flux is the hottest keyword in the React circles nowadays. Although the 
latest Flux implementation have moved towards functional paradigms
(immutability, monadic state transform) they still introduce a lot of
boilerplate, complexity and potential bugs that could be avoided by 
adopting Functional Reactive Programming.

The goal of this project is to remove all of the complexity and
provide a simple way to harness the power of FRP by using the mental 
model of Flux.


## Why to choose ffux?

Here are some points to choose `ffux` over other Flux implementations:

  * **Extremely simple** - Only single function needed: `createStore`
  * **Boilerplate-free** - Your almost every code line is effective
  * **Library/view agnostic** - Drop React and use with jQuery if you want ;-)
  * **Testable** - Stores are completely independent, thus mocking the endpoints is extremely easy
  * **Hot-reloadble** - Your application state can be re-constructed at any point
  * **Lightweight** - The whole library is under 150 LOC of ES6. :-)
  * **Expressive** - Design your own data flow by using FRP techniques you like the most

Well... You must see it by yourself:

```javascript 
const React = require("react"),
      ffux  = require("ffux")

const {createStore} = ffux

const Counter = createStore({
  actions: ["incrementN", "decrementOne"],
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
```
  
## How to use?

Install dependencies with npm and start coding

    npm i --save ffux baconjs
    
    
## API

`ffux` is designed to be used with ES6 but it can be used with ES5 as well.
In order to to use `fflux` you must require it to your project:

```javascript 
const ffux = require("ffux")
```
### `createStore({[actions,] state}) -> StoreFactory`

Creates a new store factory that contains the given actions names and state
initialization function.

* Initial state and store actions (and dependencies) are passed to the state initialization function by `ffux`
* State initialization function must return `Bacon.Property` 

```javascript 
const CounterStore = ffux.createStore({
  actions: ["icrement", "resetAsync"],
  // Parameters in state initialization function:
  //  1. initial state (passed when initializing stores)
  //  2. action streams of this store (Bacon.EventStreams) mapped behind their names
  //  3. dependency stores (see below)
  state: ({counter}, {increment, resetAsync}) => {
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
```
### Instantiation of stores

Store instances can be created by using the `StoreFactory` function. It takes
one optional parameter, dependencies (other store instances).

```javascript 
const counter = Counter()
```
### `ffux(stateModel, initialState) -> Dispatcher`

Once you've created your stores, you can create a dispatcher instance by using
the stores. Dispatcher takes two arguments:

1. State model which is a plain object of stores. *This state model should reflect your (initial) state*
2. Initial state that initializes your state streams

Dispacher has one method: `.listen(callback)`. It can be used to listen your
state changes. When the application state changes, `{state, actions}` object 
containing the current state (schema reflects the state model) and possible 
actions (all actions from your stores) is passed to the callback function.

This is the place to render your UI:

```javascript
const dispatcher = ffux({counter}, {counter: 0})
dispatcher.listen(({state, actions}) => {
  React.render(<MyApp state={state} actions={actions} />, ...)
})
```
### Declaring dependencies between stores

TODO: docs...


## License

MIT
