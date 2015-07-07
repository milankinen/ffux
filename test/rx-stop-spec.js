const {expect} = require("chai"),
      Bacon    = require("baconjs"),
      ffux     = require("../lib/ffux-rx")

const {listen, delay} = require("./test-utils")
const {createStore} = ffux

describe("rx dispatcher stopping", () => {

  const Filter = createStore({
    actions: ["resetFilter"],
    state: (initial, {resetFilter}) => resetFilter.scan(initial, (_, value) => value).startWith(initial)
  })

  it("prevents listen callback to be invoked anymore", done => {
    let stop
    stop =
      listen(ffux({filter: Filter("")}, {flatActions: true}))
        .step(({actions: {resetFilter}}) => {
          resetFilter("tsers")
        })
        .step(({state: {filter}, actions: {resetFilter}}) => {
          expect(filter).to.equal("tsers")
          stop()
          resetFilter()
          delay(20, () => {
            // using delay because we want to ensure that no more steps are
            // invoked even though resetFilter has been called. after 20 ms
            // it is safe to end this test
            done()
          })
        })
        .exec()
  })

})
