const Rx          = require("rx"),
      ffuxFactory = require("./ffux")

const {zipObject, noop} = require("./util")

const ffux = ffuxFactory(subscribe, composeStateStream, createAction, checkObservable)
export default ffux
ffux.update = update


function composeStateStream(stateModelProps) {
  const propStreams = stateModelProps.map(([name, prop]) => prop.map(value => [name, value]))
  return Rx.Observable.combineLatest(...propStreams, (...props) => zipObject(props))
}

function subscribe(stateStream, actions, callback) {
  const subs = stateStream.subscribe(
    (state) => callback({state, actions}),
    (error) => { throw error },
    noop
  )
  return (() => subs.dispose())
}

function createAction() {
  const subject = new Rx.Subject()
  return {
    stream: subject.map(noop),
    fn: (...args) => {
      if (args.length === 1) {
        subject.onNext(args[0])
      } else {
        subject.onNext(args)
      }
    }
  }
}

function checkObservable(observable) {
  if (!(observable instanceof Rx.Observable)) {
    throw new Error("Store's state stream must be a Rx.Observable with initial value (.startWith)")
  }
  return observable
}

function update(initial, ...patterns) {
  const {when}    = Rx.Observable

  if (!patterns || patterns.length === 0) {
    return new Rx.BehaviorSubject(initial)
  } else if (patterns.length % 2) {
    throw new Error("Every pattern must have the callback")
  }

  const streams   = patterns.filter((_, i) => i % 2 === 0),
        callbacks = patterns.filter((_, i) => i % 2 !== 0),
        pairs     = streams.map((_, i) => [streams[i], callbacks[i]])

  return when
    .apply(Rx.Observable, pairs.map(toJoinPattern))
    .scan(initial, (prev, f) => f(prev))
    .startWith(initial)

  function toJoinPattern([array, fn]) {
    if (array.length === 0) {
      throw new Error("Pattern must define at least one observable")
    }

    const [head, ...rest] = array
    const pattern = rest.reduce((memo, p) => memo.and(p), head)
    return pattern.thenDo((...args) => prev => fn(prev, ...args))
  }
}
