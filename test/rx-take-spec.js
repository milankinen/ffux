const {expect} = require("chai"),
      Rx       = require("rx"),
      ffux     = require("../lib/ffux-rx")

const {createStore} = ffux

describe("taking the first state from RxJS dispatcher", () => {

  const Items = createStore({
    state: (items, {}, {filter}) => {
      return Rx.Observable
        .return(items)
        .combineLatest(filter, (items, filter) => items.filter(it => it.indexOf(filter) !== -1))
    }
  })

  const Filter = createStore({
    state: (filter) => new Rx.BehaviorSubject(filter)
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
