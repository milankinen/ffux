const Rx          = require("rx"),
      ffuxFactory = require("./ffux")

const {zipObject, noop} = require("./util")

const ffux = ffuxFactory(subscribe, composeStateStream, createAction, noop)
export default ffux
ffux.update = update


function composeStateStream(readyStores) {
  const streams = readyStores.map(({name, store}) => store.state().map(s => [name, s]))
  return Rx.Observable.combineLatest(...streams, (...props) => zipObject(props))
}

function subscribe(stateStream, actions, callback) {
  stateStream.subscribe(
    (state) => callback({state, actions}),
    (error) => { throw error }
  )
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

function update(initial, ...patterns) {
  const streams = patterns.filter((_, i) => i % 2 === 0);
  const callbacks = patterns.filter((_, i) => i % 2 !== 0);
  const pairs = streams.map((_, i) =>
      [streams[i], callbacks[i]]
  );
  return Rx.Observable.when.apply(Rx.Observable, pairs.map(p =>
      p[0].thenDo(data => prev => p[1](prev, data))
  )).scan(initial, (prev, f) => f(prev))
    .startWith(initial);
}
