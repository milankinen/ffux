const Bacon = require("baconjs")

export default ffux
ffux.createStore = createStore


function ffux(stores, initialState = {}) {
  return {listen}

  function listen(callback) {
    const ready   = [],
          pending = keys(stores)

    init()
    const actions = composeActions(ready)
    const stateP  = composeStateP(ready, initialState, actions)
    subscribe(stateP, actions)

    function subscribe(stateP, actions) {
      stateP.onValue(state => callback({state, actions}))
    }

    function composeStateP(readyStores, initialState) {
      const template = zipObject(readyStores.map(({name, store}) => {
        const prop = createProperty(store.state(), initialState[name])
        return [name, prop]
      }))
      return Bacon.combineTemplate(template)

      function createProperty(streamOrProperty, propertyInitialState) {
        try {
          return streamOrProperty.toProperty(propertyInitialState)
        } catch (ignore) {
          return streamOrProperty.toProperty()
        }
      }
    }

    function composeActions(readyStores) {
      const actions = {}
      readyStores.forEach(({store}) => keys(store.actions()).forEach(a => actions[a] = store.actions()[a]))
      return actions
    }

    function init() {
      const before = pending.length
      let i = before
      while (--i >= 0) {
        const name   = pending[i],
              initFn = stores[name] || {},
              deps   = initFn.deps || {}

        const depNames  = keys(deps)
        const readyDeps = []
        depNames.forEach(dName => {
          const depStore = findReady(deps[dName])
          if (depStore) readyDeps.push([dName, depStore])
        })
        if (readyDeps.length === depNames.length) {
          ready.push({store: initFn(initialState, zipObject(readyDeps)), name, initFn})
          pending.splice(i, 1)
        }
      }
      if (pending.length && before === pending.length) {
        throw new Error("Invalid deps")
      } else if (pending.length) {
        init()
      }
    }
    function findReady(fn) {
      for (let i = 0 ; i < ready.length ; i++) {
        if (ready[i].initFn === fn) return ready[i].store
      }
    }
  }
}

function createStore({state, actions: actionNames = []}) {
  const actionsByName = zipObject(actionNames.map(a => {
    const bus = new Bacon.Bus()
    return [a, {
      stream: bus.map(noop),
      fn: (...args) => {
        if (args.length === 1) {
          bus.push(args[0])
        } else {
          bus.push(args)
        }
      }
    }]
  }))
  const actionStreams    = zipObject(keys(actionsByName).map(name => [name, actionsByName[name].stream]))
  const actionInterfaces = zipObject(keys(actionsByName).map(name => [name, actionsByName[name].fn]))

  return function store(dependencyDefinitions) {
    init.deps = dependencyDefinitions
    return init

    function init(initialState, dependencies) {
      const stateP = state(initialState, actionStreams, dependencies)
      return {state: () => stateP, actions: () => actionInterfaces}
    }
  }
}

function keys(obj) {
  return Object.keys(obj)
}

function zipObject(fields) {
  const obj = {}
  fields.forEach(([k, v]) => obj[k] = v)
  return obj
}

function noop(arg) {
  return arg
}
