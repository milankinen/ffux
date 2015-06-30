const {expect} = require("chai"),
      Bacon    = require("baconjs"),
      Rx       = require("rx"),
      ffux    = require("../lib/ffux-rx")

const {createStore} = ffux

describe("rx state stream creation", () => {

  const Counter = createStore({
    state: (counter) => new Rx.BehaviorSubject(counter)
  })

  const Plus2 = createStore({
    state: (value) => new Rx.BehaviorSubject(value + 2)
  })

  it("uses the given initial state to construct the store's state stream", done => {
    ffux({a: Counter(2), b: Plus2(1)}).listen(({state}) => {
      expect(state.a).to.equal(2)
      expect(state.b).to.equal(3)
      done()
    })
  })

})
