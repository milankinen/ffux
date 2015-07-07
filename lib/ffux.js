const {noop, keys, zipObject, defer, pairs, merge} = require("./util")

export default function ffuxFactory(subscribe, composeAppStateStream, createAction, checkStateStream) {
  ffux.createStore = createStore
  return ffux

  function ffux(stateModel, opts = {}) {
    checkStateModelIsValid(stateModel)
    const actions = composeActions(pairs(stateModel))
    return {
      listen,
      take,
      getActions,
      getInitialState
    }

    function listen(callback) {
      const stateStream = composeAppStateStream(pairs(stateModel), actions)
      return subscribe(stateStream, actions, callback)
    }

    function take(callback) {
      let stop
      stop = listen(model => {
        defer(() => {
          stop()
          callback(model)
        })
      })
    }

    function getActions() {
      return actions
    }

    function getInitialState() {
      return zipObject(pairs(stateModel).map(([name, store]) => [name, store.ffuxInitialState()]))
    }

    function checkStateModelIsValid(model) {
      const invalidCount = pairs(model).filter(([_, store]) => !(store && store.__ffuxStore === true))
      if (invalidCount > 0) {
        throw new Error("Only stores are accepted in the state model")
      }
    }

    function composeActions(stateModelProps) {
      const actions = {}
      if (opts.flatActions) {
        stateModelProps.forEach(([name, prop]) => {
          const propActions = prop.ffuxActions()
          pairs(propActions).forEach(([actionName, action]) => {
            if (actions[actionName]) {
              throw new Error(`Action "${actionName}" defined more than once`)
            }
            actions[actionName] = action
          })
        })
      } else {
        pairs(stateModel).forEach(([name, prop]) => actions[name] = prop.ffuxActions())
      }
      return actions
    }
  }

  function createStore({state, actions: actionNames = []}) {
    return function store(initialState, dependencies = {}) {
      if (arguments.length === 0) {
        throw new Error("Initial state must be given to the store")
      }

      const actionsByName = zipObject(actionNames.map(a => {
        return [a, createAction(a)]
      }))
      const actionStreams    = zipObject(keys(actionsByName).map(name => [name, actionsByName[name].stream]))
      const actionInterfaces = zipObject(keys(actionsByName).map(name => [name, actionsByName[name].fn]))

      const stateStream = checkStateStream(state(initialState, actionStreams, dependencies), initialState)
      stateStream.ffuxActions = () => actionInterfaces
      stateStream.ffuxInitialState = () => initialState
      return stateStream
    }
  }
}

