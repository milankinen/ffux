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

### `createStore({[actions,] state}) -> StoreDef`

Creates a new store definition having the given actions and state stream.

Function takes object that can have two fields:

* `state` : Mandatory field that returns a `Bacon.Property` or `Rx.Observable`
* `actions` : Optional array that contains store's actions. These actions are
passed to the `state` function as EventStreams / Observables

```javascript
// Bacon.js
const Counter = ffux.createStore({
  actions: ["increment", "resetAsync"],
  // Parameters in state initialization function are:
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
const Counter = ffux.createStore({
  actions: ["increment"],
  // same parameters as Bacon.js but now actions Rx.Observable instances
  state: (counter, {increment}) => {
    const resetS = resetAsync.delay(1000)
    // state function must return an Rx.Observable
    return increment
      .scan(counter, (state, delta) => state + delta)
      .startWith(counter)
  }
```

### `ffux({<prop1>: Store, <prop2>: Store, ...}) -> Dispatcher`

By using the `StoreDef` functions, you can instantiate actual store instances. In
order to instantiate a store instance, you must call `StoreState`function with the
store's  dinitial state:

```javascript
const counter = Counter(10)
const Filter  = Filter("")  // another store
```

Once you've created the store instances you can use the to form your application
**state model**. State model is just a flat JavaScript object containing store
instances as values. *This state model should reflect your (initial) state*

```javascript
const stateModel = {counter: Counter(10), filter: Filter("")}
```

You can create a `ffux` dispatcher by using the state model. The created dispacher
has one method: `.listen(callback)`. It can be used to listen your state changes.
When the application state changes, a `{state, actions}` object containing the
current state (schema reflects the state model) and action creators is passed
to the callback function.

```javascript
const dispatcher = ffux({counter})
dispatcher.listen(({state, actions}) => {
  // state == {counter: 10}
  // actions == {counter: {increment: <function>, resetAsync: <function>}}
  React.render(<MyApp state={state} actions={actions} />, ...)
})
```

### Action creators

After you have created the dispatcher instance and started to listen the state
model changes, you can use your stores' **action creators**. `ffux` creates these
action creators automatically based on you `StoreDef` actions. These action creators
are just plain functions that can be accessed from inside the `dispacher.listen`
callback:

```javascript
const Filter = ffux.createStore({
  actions: ["resetFilter"],
  state: (initialState, {resetFilter}) => {
    ...
  }
})

ffux({filter: Filter("")}).listen(({state, actions}) => {
  const resetFilter = actions.filter.resetFilter
  console.log(resetFilter) // => "function"
})
```

Action creators can be invoked with either zero, one or many parameters. When
action creator is invoked with zero or one parameter then that parameter is
passed to the action event stream as it is:

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
    const trimmedAsync = resetFilter.flatMap(([value, timeout]) => ...)
    ...
  })
})
// and usage inside your app
resetFilter("tsers", 1000)
```

#### Flattening actions creators

By default, action creators are passed using the same schema as the state model. However,
you can flatten them into `actions` object by passing `flatActions = true` option
to the dispatcher. In that case remember that if action creator names clash, an error
is thrown during dispatcher initialization:

```javascript
const dispatcher = ffux({counter, filter}, {flatActions: true})
dispatcher.listen(({state, actions}) => {
  // actions == {increment: <function>, resetAsync: <function>, resetFilter: <function>}
  React.render(<MyApp state={state} actions={actions} />, ...)
})
```

### Declaring dependencies between stores

In complex applications, dependencies are inevitable. Normal Flux implementations
use signals and publish-subscribe to resolve this. This method provides extremely
decoupled components but it has a major drawback: when dependencies become more complex,
their management becomes chaotic and unpredictable because causations are not
visible, thus there are high possibility to introduce e.g. cyclic dependencies.

`ffux` takes another approach: dependencies between stores are declared explicitly.
This ensures you to think about responsibilities of your stores and reduce the
possibility of circular dependencies and such kind of bugs.

In `ffux` you can declare dependencies during the store instantiation by passing
the dependencies as a second parameter to the store. They can be anything - other
stores, function or constants.

```javascript
const todos = Todos([], {...here comes the dependencies...})
```

#### Stores are event streams!

This is essential when defining dependencies. Since the stores are event streams,
you can treat them like actions. Imagine that you have to-do items that depend on
the current filter value (in order to detect which items to display). Since the
`Filter` store is an event stream, you can pass it as a dependency to the `Todos`
store and get filter changes directly:

```javascript
const Todos = createStore({
  state: (items, {}, {filter}) => {
    // every time when filter changes, it will run the filtering again, thus
    // causing a state change with the new displayed items
    return Bacon.combineTemplate({items, filter})
      .map(({items, filter}) => items.filter(it => it.indexOf(filter) !== -1))
  }
})

// pass filter like any other dependency
const filter = Filter("")
const todos  = Todos([], {filter})
ffux({todos, filter}).listen(...)
```

### Using React helper component

`ffux` provides a helper component for React development: `<Listener>`. `Listener` 
takes two properties: `initialState` and `dispatcher`. The first one is a JavaScript
object that represents the initial state of your application. The second one is
a function `(state) => Dispatcher` building a dispatcher instance from state object.

Surround your application component with Listener: state and actions are propagated
automatically to your application component.

```javascript
const {Listener} = require("ffux/react")

const App = React.createClass({
  render() {
    return (
      <Listener initialState={{counter: 10}}
                dispatcher={state => ffux({counter: Counter(state.counter)})}>
        <MyAppComponent />
      </Listener>
    )
  }
})

React.render(<App />, document.getElementById("app"))
``` 

#### Hot (re)loading

Yes. `Listener` component is hot-reloadable by default.


### Isomorphic app development

`ffux` has a native support for isomorphic application development. When you 
have created your `ffux` dispatcher, you can get the initial state with 
`.take(callback)` method and use the fetched model to render your application
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


### Stopping the Dispatcher

Dispatcher `.listen` method returns stop function that can be invoked
in order to stop the event listening. After stop method is called, no
new events are dispatched.

```javascript 
const dispatcher = ffux(...)
const stop = dispatcher.listen(model => { ... })

// you can stop listening events by calling the returned stop function
stop()
``` 

Normally you shouldn't need to call the `stop` method from your application
but if you are implementing e.g. your own hot reloading functionality,
it may be useful.

## License

MIT
