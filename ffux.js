
export default ffux

ffux.createStore = createStore
ffux.pure        = pureAction
ffux.impure      = impureAction


function ffux(stores) {
  const state = zipObject(Object.keys(stores).map(name => {
    const {initialState} = stores[name]
    return [name, initialState]
  }))

  const actions = zipObject(Object.keys(stores).map(name => {
    const {actionInterfaces} = stores[name]
    return [name, actionInterfaces]
  }))

  const dispatchFn = (tickFn) => {
    Object.keys(stores).forEach(name => {
      const {stateChangeHandlers} = stores[name]
      stateChangeHandlers.push((storeState) => {
        state[name] = storeState
        tickFn({state, actions})
      })
    })
    tickFn({state, actions})
  }

  return {
    dispatch: dispatchFn,
    state: () => state,
    actions: () => actions
  }
}

function createStore(actions) {
  return function (initialState, deps) {
    const state = {value: initialState}
    const stateChangeHandlers = []

    const storeActions = Object.keys(actions).map(name => {
      const handler  = actions[name]
      return {name, handler}
    })

    let actionInterfaces
    actionInterfaces = zipObject(storeActions.map(({name, handler}) => {
      function actionInterface() {
        const args = argArray(arguments)
        if (isPure(handler)) {
          state.value = handler.apply(null, [{state: state.value, deps}, ...args])
          notifyChanged(state.value)
        } else {
          handler.apply(null, [{state: state.value, deps, self: actionInterfaces}, ...args])
        }
      }
      return [name, actionInterface]
    }))

    return {
      initialState,
      stateChangeHandlers,
      actionInterfaces,
      state: () => state.value
    }

    function isPure(fn) {
      return fn && fn.__ffux_pure === true
    }

    function notifyChanged(newState) {
      stateChangeHandlers.forEach(h => h(newState))
    }
  }
}

function pureAction(fn) {
  fn.__ffux_pure = true
  return fn
}

function impureAction(fn) {
  fn.__ffux_pure = false
  return fn
}

function argArray(args) {
  return Array.prototype.slice.call(args)
}

function zipObject(pairs) {
  const obj = {}
  pairs.forEach(([k, v]) => obj[k] = v)
  return obj
}
