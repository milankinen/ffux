const Rx   = require("rx"),
      ffux = require("ffux/rx"),
      _    = require("lodash")

const {createStore} = ffux

export default function appState(initialState) {
  const {filter = "", items = [], newTodo = ""} = initialState

  const filterS  = Filter(filter)
  const itemsS   = Todos(items, {filter: filterS})
  const newTodoS = NewTodo(newTodo)

  return ffux({
    filter: filterS,
    items: itemsS,
    newTodo: newTodoS
  }, {flatActions: true})
}


const Todos = createStore({
  actions: ['createItem'],
  state: (items, {createItem}, {filter}) => {
    const itemsS = createItem
      .scan(items, (todos, newTodo) => [...todos, {text: newTodo}])
      .startWith(items)

    return Rx.Observable.combineLatest(itemsS, filter,
      (items, f) => items.map(it => _.extend({}, it, {display: isDisplayable(it, f)})))

    function isDisplayable(item, filter) {
      return item.text.toLowerCase().indexOf(filter.toLowerCase()) !== -1
    }
  }
})

const NewTodo = createStore({
  actions: ['setNewTodoText'],
  state: (newTodoText, {setNewTodoText}) => {
    return setNewTodoText.startWith(newTodoText)
  }
})

const Filter = createStore({
  actions: ['resetFilter'],
  state: (filter, {resetFilter}) => {
    return resetFilter.startWith(filter)
  }
})
