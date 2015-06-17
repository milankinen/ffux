export default ffux

ffux.createStore = createStore
ffux.pure        = pure
ffux.impure      = impure

function pure(fn) {
  return function action(store, notifyAllowed) {
    return function() {
      const args = argArray(arguments),
            deps = zipObject(keys(store.deps).map(d => [d, store.deps[d].state()]))
      store.state = fn.apply(null, [{state: store.state, deps}, ...args])
      if (notifyAllowed) store.notify()
    }
  }
}

function impure(fn) {
  return function action(store) {
    return function() {
      const args  = argArray(arguments),
            state = () => store.state
      fn.apply(null, [{state, deps: store.deps, self: store.actions}, ...args])
    }
  }
}

function createStore({actions, reactions}) {
  return function (initialState, deps) {
    const store = {
      state: initialState,
      deps: deps || {},
      listeners: [],
      listen(cb) {
        this.listeners.push(cb)
      },
      notify() {
        this.listeners.forEach(l => l(this.state))
      }
    }

    store.actions = zipObject(keys(actions).map(name => [name, actions[name].call(null, store, true)]))

    // setup reaction chain
    keys(reactions).forEach(name => {
      const reaction   = reactions[name].call(null, store, false),
            dependency = deps && deps[name]
      if (dependency) {
        dependency.__internalStore().listen((dep) => {
          const stateBefore = store.state
          reaction(dep)
          if (stateBefore !== store.state) {
            defer(() => store.notify())
          }
        })
      }
    })

    return {
      __internalStore: () => store,
      state:           () => store.state,
      actions:         () => store.actions
    }
  }
}

function ffux(stores) {
  return (function dispatcher(allActions) {
    return {
      state:   () => buildState,
      actions: () => allActions,
      flatten: () => dispatcher(values(actions).reduce((all, a) => [...all, ...a], a)),
      listen:  (dispatch) => {
        // bind state change listeners
        keys(stores).forEach(name => {
          const store = stores[name].__internalStore()
          if (store.listeners.length === 0) {
            store.listen(() => {
              dispatch({state: buildState(stores), actions: allActions})
            })
          }
        })
        // initial
        dispatch({state: buildState(stores), actions: allActions})
      }
    }
  })(zipObject(keys(stores).map(name => [name, stores[name].actions()])))

  function buildState(stores) {
    return zipObject(keys(stores).map(name => [name, stores[name].state()]))
  }
}

function argArray(args) {
  return Array.prototype.slice.call(args)
}

function zipObject(pairs) {
  const obj = {}
  pairs.forEach(([k, v]) => obj[k] = v)
  return obj
}

function keys(o) {
  return Object.keys(o || {})
}

function values(o) {
  return keys(o || {}).map(k => o[k])
}

function defer(fn) {
  return setTimeout(fn, 0)
}
