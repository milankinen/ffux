const Bacon       = require("baconjs"),
      ffuxFactory = require("./ffux")

const {zipObject, noop} = require("./util")

const ffux = ffuxFactory(subscribe, composeStateP, createAction)
export default ffux


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

function subscribe(stateP, actions, callback) {
  stateP.onValue(state => callback({state, actions}))
}

function createAction() {
  const bus = new Bacon.Bus()
  return {
    stream: bus.map(noop),
    fn: (...args) => {
      if (args.length === 1) {
        bus.push(args[0])
      } else {
        bus.push(args)
      }
    }
  }
}
