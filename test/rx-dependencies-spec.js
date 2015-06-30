const {expect} = require("chai"),
      Rx       = require("rx"),
      {listen} = require("./test-utils"),
      ffux     = require("../lib/ffux-rx")

const {createStore} = ffux

describe("rx dependencies", () => {

  const Filter = createStore({
    actions: ["resetFilter"],
    state: (initial, {resetFilter}) => {
      return resetFilter
        .startWith(initial)
        .scan(initial, (_, value) => value)
    }
  })

  const Items = createStore({
    state: (items, _, {filter}) => {
      return Rx.Observable
        .combineLatest(Rx.Observable.return(items), filter, (items, f) => ({items, f}))
        .map(({items, f}) => items.filter(it => it.indexOf(f) !== -1))
    }
  })

  it("are declared explicitly during store instantiation", done => {
    const filter = Filter(""),
          items  = Items(["foobar", "tsers"], {filter})

    listen(ffux({items, filter}))
      .step(({state: {items, filter}, actions: {filter: {resetFilter}}}) => {
        expect(filter).to.equal("")
        expect(items).to.deep.equal(["foobar", "tsers"])
        resetFilter("tse")
      })
      .step(({state: {filter}}) => {
        expect(filter).to.equal("tse")
      })
      .step(({state: {items}}) => {
        expect(items).to.deep.equal(["tsers"])
        done()
      })
      .exec()
  })

  it("throw exception if state model does not contain all dependencies", done => {
    try {
      ffux({items: Items([], {filter: Filter()})})
    } catch(ignore) {
      done()
    }
  })
})
