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

  const NoProperty = createStore({
    state: () => ({msg: "tsers"})
  })

  it("uses the given initial state to construct the store's state stream", done => {
    ffux({a: Counter(2), b: Plus2(1)}).listen(({state}) => {
      expect(state.a).to.equal(2)
      expect(state.b).to.equal(3)
      done()
    })
  })

  it("throws exception if returned state value is not an Observable instance", done => {
    try {
      NoProperty({})
    } catch(ignore) {
      done()
    }
  })

  it("throws an exception if initial state is not given", done => {
    try {
      Counter()
    } catch (ignore) {
      done()
    }
  })
})
