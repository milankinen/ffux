const {expect} = require("chai"),
      Bacon    = require("baconjs"),
      Rx       = require("rx"),
      ffuxB    = require("../lib/ffux-bacon"),
      ffuxR    = require("../lib/ffux-rx")


describe("state stream creation", () => {
  describe("in baconjs", () => {
    bacon(ffuxB)
  })

  describe("in rxjs", () => {
    rx(ffuxR)
  })

  function bacon(ffux) {
    const {createStore} = ffux

    const Counter = createStore({
      state: (counter) => Bacon.constant(counter)
    })

    const Plus2 = createStore({
      state: (value) => Bacon.constant(value + 2)
    })

    const NoProperty = createStore({
      state: () => Bacon.never()
    })


    it("uses the given initial state to construct the store's state stream", done => {
      ffux({a: Counter(2), b: Plus2(1)}).listen(({state}) => {
        expect(state.a).to.equal(2)
        expect(state.b).to.equal(3)
        done()
      })
    })

    it("throws an exception if store's state stream is not a Bacon.Property", done => {
      try {
        ffux({noProp: NoProperty()})
      } catch (ignore) {
        done()
      }
    })
  }

  function rx(ffux) {
    const {createStore} = ffux

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

  }

})
