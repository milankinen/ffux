const {expect} = require("chai"),
      Bacon    = require("baconjs"),
      ffux     = require("../lib/ffux-bacon")

const {createStore} = ffux

describe("actions", () => {

  const Counter = createStore({
    actions: ["increment", "reset"],
    state: (counter, {increment, reset}) => {
      const resetAsync = reset.flatMap(([timeout, value]) => Bacon.later(timeout, value))

      return Bacon.update(counter,
        [increment],  (state, delta) => state + delta,
        [resetAsync], (_, value) => value
      )
    }
  })

  const Plus2 = createStore({
    state: (value) => Bacon.constant(value + 2)
  })

  it("can be called like normal functions", done => {
    let count = 0
    ffux({a: Counter(2), b: Plus2(1)}).listen(({state: {a, b}, actions}) => {
      count++
      if (count === 1) {
        expect(a).to.equal(2)
        expect(b).to.equal(3)
        actions.increment(2)
      } else {
        expect(a).to.equal(4)
        expect(b).to.equal(3)
        done()
      }
    })
  })

  it("supports multiple arguments via array", done => {
    let count = 0
    ffux({a: Counter(2), b: Plus2(1)}).listen(({state: {a}, actions}) => {
      count++
      if (count === 1) {
        actions.reset(10, 5)
      } else {
        expect(a).to.equal(5)
        done()
      }
    })
  })

  it("initialization throws an exception if action names are clashing", (done) => {
    try {
      ffux({a: Counter(2), b: Counter(1)})
    } catch (ignore) {
      done()
    }
  })
})
