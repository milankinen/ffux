const {expect} = require("chai"),
      Bacon    = require("baconjs"),
      ffux     = require("../lib/ffux-bacon")

const {createStore} = ffux

describe("baconjs dispatcher .take", () => {

  const Items = createStore({
    state: (items, {}, {filter}) => {
      return Bacon
        .combineTemplate({items, filter})
        .map(({items, filter}) => items.filter(it => it.indexOf(filter) !== -1))
    }
  })

  const Filter = createStore({
    state: (filter) => Bacon.constant(filter)
  })

  it("is immutable", done => {
    const filter = Filter("tse"),
          items  = Items(["tsers", "foobar"], {filter})
    const dispatcher = ffux({items, filter})
    dispatcher.take(({state}) => {
      dispatcher.take(({state: state2}) => {
        expect(state).to.deep.equal({items: ["tsers"], filter: "tse"})
        expect(state2).to.deep.equal(state)
        done()
      })
    })
  })

})
