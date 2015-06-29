const {expect} = require("chai"),
      Rx       = require("rx"),
      {listen} = require("./test-utils"),
      ffux     = require("../lib/ffux-rx")

const {createStore, update} = ffux
const {defer} = require("../lib/util")

describe("rx .update", () => {

  const NoPatterns = createStore({
    state: (initial) => {
      return update(initial)
    }
  })

  const OddPatterns = createStore({
    actions: ["noop"],
    state: (initial, {noop}) => {
      return update(initial, [noop])
    }
  })

  const EmptyObservables = createStore({
    state: (initial) => {
      return update(initial, [], (_) => 0)
    }
  })

  const MultiObservables = createStore({
    actions: ["ready", "set", "go"],
    state: (initial, {ready, set, go}) => {
      return update(initial,
        [ready, set, go], _ => 1
      )
    }
  })

  it("returns the initial value if no patterns is defined", done => {
    listen(ffux({upd: NoPatterns(10)}))
      .step(({state}) => {
        expect(state.upd).to.equal(10)
        done()
      })
      .exec()
  })

  it("throws an exception if patterns don't have the corresponding callback", done => {
    try {
      ffux({upd: OddPatterns(0)}).listen(_ => {})
    } catch(ignore) {
      done()
    }
  })

  it("throws an exception if patterns have an empty observable array", done => {
    try {
      ffux({upd: EmptyObservables(0)}).listen(_ => {})
    } catch(ignore) {
      done()
    }
  })

  it("supports multiple observables match patterns", done => {
    listen(ffux({upd: MultiObservables(0)}, {flatActions: true}))
      .step(({state, actions: {ready, set, go}}) => {
        expect(state.upd).to.equal(0)
        defer(ready)
        defer(set)
        defer(go)
      })
      .step(({state}) => {
        expect(state.upd).to.equal(1)
        done()
      })
      .exec()
  })
})
