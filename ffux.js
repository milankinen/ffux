const Bacon = require("baconjs")

ffux.run = run
export default ffux

function ffux({initialState, actions}) {
  return function (initState) {
    const initial = arguments.length > 0 ? initState
      : typeof initialState !== "undefined" ? initialState
      : undefined

    const triggers = Object.keys(actions).map(name => {
      const bus = new Bacon.Bus()
      const fn  = _ => bus.push.call(bus, {value: arguments})
      const cb  = actions[name]
      return {name, fn, bus, cb}
    })

    const patterns = triggers.reduce((memo, {bus, cb}) => [...memo, ...[[bus], step(cb)]], [])

    return {
      stateP: Bacon.update.apply(Bacon, [initial, ...patterns]),
      actions: zipObject(triggers.map(({name, fn}) => [name, fn]))
    }
  }
}

function run(stores, onValueCallback) {
  const stateTemplate = zipObject(Object.keys(stores).map(name => {
    const {stateP} = stores[name]
    return [name, stateP]
  }))

  const actions = zipObject(Object.keys(stores).map(name => {
    const {actions} = stores[name]
    return [name, actions]
  }))

  const appStateP = Bacon.combineTemplate(stateTemplate)
  appStateP.onValue((state) => {
    onValueCallback({state, actions})
  })
}

function step(actionCallback) {
  return (state, {value}) => {
    return actionCallback.apply(null, [state, ...argArray(value)])
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
