const {noop, keys, zipObject} = require("./util")

export default function ffuxFactory(subscribe, composeStateStream, createAction) {
  ffux.createStore = createStore
  return ffux

  function ffux(stateModel, initialState) {
    return {listen}

    function listen(callback) {
      const ready   = [],
            pending = keys(stateModel)

      init()
      const actions = composeActions(ready)
      const stateP  = composeStateStream(ready, initialState, actions)
      subscribe(stateP, actions, callback)


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
                initFn = stateModel[name] || {},
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
      return [a, createAction(a)]
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
}

