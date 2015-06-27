const {expect} = require("chai"),
      Bacon    = require("baconjs"),
      {listen} = require("./test-utils"),
      ffux     = require("../lib/ffux-bacon")

const {createStore} = ffux

describe("dependencies", () => {

  const Filter = createStore({
    actions: ["resetFilter"],
    state: (initial, {resetFilter}) => resetFilter.scan(initial, (_, value) => value)
  })

  const Items = createStore({
    state: (items, _, {filter}) => {
      return Bacon.combineTemplate({items, f: filter.state()})
        .map(({items, f}) => items.filter(it => it.indexOf(f) !== -1))
    }
  })

  it("are declared explicitly during store instantiation", done => {
    const filter = Filter(""),
          items  = Items(["foobar", "tsers"], {filter})

    listen(ffux({filter, items}))
      .step(({state: {items, filter}, actions: {resetFilter}}) => {
        expect(filter).to.equal("")
        expect(items).to.deep.equal(["foobar", "tsers"])
        resetFilter("tse")
      })
      .step(({state: {items, filter}}) => {
        expect(filter).to.equal("tse")
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
