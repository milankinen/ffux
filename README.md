# ffux

Completely library agnostic functional flux implementation

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/ffux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

- - -

No boilerplate. No complex APIs. No external dependencies. Just a set of *pure/impure* actions.

(more docs coming soon..)


## How does it differs from other flux'es

There are furious wars going on concerning the responsibilities of actions and stores.
Who is responsible for AJAX calls (and more generally: causing side effects)? Others say
it's stores, another ones say actions. Ugh, what a mess..

Actually, the whole problem reduces into two types of functions: `pure` functions take 
input and return output, `impure` functions cause side-effects. **If your function is
pure, then it DOES NOT cause side effects. Period.** 

But how does this relate to Flux? Let's replace the word "function" with "action".
And that's it. You can construct your stores by using a set of `pure` and `impure`
actions: with pure actions you can modify the state of your store, with impure actions
you can cause side effects (make AJAX request, call action from another store, ...).

In practice this means that you can build your application's data flow by using 
only three API functions: `createStore`, `pure` and `impure` (more detailed API
docs coming soon..).

No separation of actions/stores. No registerers/listeners. No `waitFor`.
No React `Dispatcher` components. Just your code.


## Examples

Enough talk! Show me some code.

### Basics

```javascript 
const React = require("react"),
      ffux  = require("ffux")

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
  ffux({counter: Counter(10)}).listen((model) => {
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
```

### Store dependencies

```javascript 
const React = require("react"),
      _     = require("lodash"),
      ffux  = require("ffux")

const {createStore, pure, impure} = ffux


const Items = createStore({
  actions: {
    // we can access the dependencies by using "deps" field. these dependencies
    // must be defined explicitly when creating an instance of the store
    addNextItem: pure(({state, deps: {filter}}) => ({
      saved: [...state.saved, {text: state.nextText}].map(it => applyFilter(it, filter.state())),
      nextText: ""
    })),
    setNextItemText: pure(({state}, text) => _.extend({}, state, {nextText: text}))
  },
  // these reactions are not visible in the store's public API
  reactions: {
    // reacting to every filter change, the new filter state is passed
    // as a second parameter. also impure actions are possible
    "filter": pure(({state}, filter) => _.extend({}, state, {
      saved: state.saved.map(it => applyFilter(it, filter))
    }))
  }
})

function applyFilter(item, filter) {
  return _.extend({}, item, {show: item.text.indexOf(filter) !== -1})
}

// filter knows nothing about items
const Filter = createStore({
  actions: {
    resetFilter: pure((_, filter) => filter)
  }
})

window.onload = function() {
  const filter = Filter(""),
        // define filter dependency in items, note that dependencies must be passed
        // explicitly -> no circular references -> less bugs
        items  = Items({saved: [], nextText: ""}, {filter})

  ffux({items, filter}).listen((model) => {
    React.render(<App {...model} />, document.getElementById("app"))
  })
}

const App = React.createClass({
  render() {
    // same stuff as in the previous example
    const {filter, items} = this.props.state
    const {resetFilter} = this.props.actions.filter
    const {addNextItem, setNextItemText} = this.props.actions.items

    return (
      <div>
        <ul>{items.saved.filter(it => it.show).map(it => <li>{it.text}</li>)}</ul>
        <div>
          <input value={filter} onChange={e => resetFilter(e.target.value)} placeholder="Filter" />
        </div>
        <div>
          <input
            placeholder="New item"
            value={items.nextText}
            onChange={e => setNextItemText(e.target.value)}
            onKeyDown={e => { if (e.which === 13) addNextItem() }}
            />
        </div>
      </div>
    )
  }
})
```


## Got interested?

Problems? Ideas? Gotchas? Join Gitter chat and let's continue development together!


## License

MIT
