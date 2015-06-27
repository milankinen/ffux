const {noop, keys, zipObject} = require("./util")

export default function ffuxFactory(subscribe, composeAppStateStream, createAction, checkStateStream) {
  ffux.createStore = createStore
  return ffux

  function ffux(stateModel, opts = {}) {
    const {stateStream, actions} = initActionsAndStateStream()
    return {listen}

    function listen(callback) {
      subscribe(stateStream, actions, callback)
    }

    function initActionsAndStateStream() {
      const ready   = [],
            pending = keys(stateModel)

      init()
      const actions     = composeActions(ready)
      const stateStream = composeAppStateStream(ready, actions)
      return {actions, stateStream}

      function composeActions(readyStores) {
        const actions = {}
        if (opts.flatActions) {
          readyStores.forEach(({store}) => keys(store.actions()).forEach(a => {
            if (actions[a]) {
              throw new Error(`Action "${a}" defined more than once`)
            }
            actions[a] = store.actions()[a]
          }))
        } else {
          readyStores.forEach(({store, name}) => actions[name] = store.actions())
        }
        return actions
      }

      function init() {
        const before = pending.length
        let i = before
        while (--i >= 0) {
          const name   = pending[i],
                initFn = stateModel[name],
                deps   = initFn.deps || {}

          const depNames  = keys(deps)
          const readyDeps = []
          depNames.forEach(dName => {
            const depStore = findReady(deps[dName])
            if (depStore) readyDeps.push([dName, depStore.state()])
          })
          if (readyDeps.length === depNames.length) {
            ready.push({store: initFn(zipObject(readyDeps)), name, initFn})
            pending.splice(i, 1)
          }
        }
        if (pending.length && before === pending.length) {
          throw new Error("Invalid dependencies")
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
    return function store(initialState, dependencyDefinitions) {
      const actionsByName = zipObject(actionNames.map(a => {
        return [a, createAction(a)]
      }))
      const actionStreams    = zipObject(keys(actionsByName).map(name => [name, actionsByName[name].stream]))
      const actionInterfaces = zipObject(keys(actionsByName).map(name => [name, actionsByName[name].fn]))

      init.deps = dependencyDefinitions
      return init

      function init(dependencies) {
        const stateStream = checkStateStream(state(initialState, actionStreams, dependencies), initialState)
        return {state: () => stateStream, actions: () => actionInterfaces}
      }
    }
  }
}

