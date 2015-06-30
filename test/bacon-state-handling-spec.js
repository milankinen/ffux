const {expect} = require("chai"),
      Bacon    = require("baconjs"),
      Rx       = require("rx"),
      ffux     = require("../lib/ffux-bacon")

const {createStore} = ffux

describe("baconjs state stream creation", () => {

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

})
