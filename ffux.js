
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
    Object.keys(stores).forEach(name => {
      const {setReactions} = stores[name]
      setReactions()
    })
    tickFn({state, actions})
  }

  return {
    dispatch: dispatchFn,
    state: () => state,
    actions: () => actions
  }
}

function createStore({actions, reactions}) {
  return function (initialState, deps) {
    const state = {value: initialState}
    const stateChangeHandlers = []

    const storeActions = Object.keys(actions).map(name => {
      const handler  = actions[name]
      return {name, handler}
    })

    const setReactions = () => {
      Object.keys(reactions || []).forEach(dep => {
        const handler = reactions[dep],
              action  = reaction(actionInterface(handler))

        if (deps[dep]) {
          const handlers = deps[dep].stateChangeHandlers
          for(let i = 0 ; i < handlers.length; i++) {
            if (isReaction(handlers[i])) handlers.splice(i, 1)
          }
          handlers.push(action)
        }
      })
    }

    let actionInterfaces
    actionInterfaces = zipObject(storeActions.map(({name, handler}) => {
      return [name, actionInterface(handler)]
    }))

    return {
      initialState,
      stateChangeHandlers,
      actionInterfaces,
      setReactions,
      state: () => state.value
    }

    function actionInterface(handler) {
      return function() {
        const args = argArray(arguments)
        if (isPure(handler)) {
          state.value = handler.apply(null, [{state: state.value, deps}, ...args])
          notifyChanged(state.value)
        } else {
          handler.apply(null, [{state: state.value, deps, self: actionInterfaces}, ...args])
        }
      }
    }
    function isPure(fn) {
      return fn && fn.__ffux_pure === true
    }

    function notifyChanged(newState) {
      stateChangeHandlers.forEach(h => h(newState))
    }
  }
}

function isReaction(fn) {
  return fn.__ffux_reaction === true
}

function reaction(fn) {
  fn.__ffux_reaction = true
  return fn
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
