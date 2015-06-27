const {expect} = require("chai"),
      Bacon    = require("baconjs"),
      {listen} = require("./test-utils"),
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
    actions: ["noop"],
    state: (value) => Bacon.constant(value + 2)
  })

  it("can be called like normal functions", done => {
    listen(ffux({a: Counter(2), b: Plus2(1)}))
      .step(({state: {a, b}, actions: {a: {increment}}}) => {
        expect(a).to.equal(2)
        expect(b).to.equal(3)
        increment(2)
      })
      .step(({state: {a, b}}) => {
        expect(a).to.equal(4)
        expect(b).to.equal(3)
        done()
      })
      .exec()
  })

  it("supports multiple arguments via array", done => {
    listen(ffux({a: Counter(2), b: Plus2(1)}))
      .step(({actions: {a: {reset}}}) => reset(10, 5))
      .step(({state: {a}}) => {
        expect(a).to.equal(5)
        done()
      })
      .exec()
  })

  it("supports flattening of store actions into single layer", done => {
    listen(ffux({a: Counter(2), b: Plus2(1)}, {flatActions: true}))
      .step(({actions: {noop, increment, reset}}) => {
        expect(typeof noop).to.equal("function")
        expect(typeof increment).to.equal("function")
        expect(typeof reset).to.equal("function")
        done()
      })
      .exec()
  })

  it("initialization throws an exception if flattened action names are clashing", (done) => {
    try {
      ffux({a: Counter(2), b: Counter(1)}, {flatActions: true})
    } catch (ignore) {
      done()
    }
  })
})
