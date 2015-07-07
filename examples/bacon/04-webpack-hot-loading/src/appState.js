const Bacon = require("baconjs"),
      ffux  = require("ffux"),
      _     = require("lodash")

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
    const itemsP = createItem.scan(items, (todos, newTodo) => [...todos, {text: newTodo + "!"}])

    return Bacon
      .combineTemplate({items: itemsP, filter: filter})
      .map(({items, filter}) => items.map(it => _.extend({}, it, {display: isDisplayable(it, filter)})))

    function isDisplayable(item, filter) {
      return item.text.toLowerCase().indexOf(filter.toLowerCase()) !== -1
    }
  }
})

const NewTodo = createStore({
  actions: ['setNewTodoText'],
  state: (newTodoText, {setNewTodoText}) => {
    return setNewTodoText.scan(newTodoText, (_, newText) => newText)
  }
})

const Filter = createStore({
  actions: ['resetFilter'],
  state: (filter, {resetFilter}) => {
    return resetFilter.scan(filter, (_, newFilter) => newFilter)
  }
})
