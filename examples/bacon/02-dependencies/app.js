const React = require("react"),
      Bacon = require("baconjs"),
      ffux  = require("ffux"),
      _     = require("lodash")

const {Listener} = require("ffux/react")
const {createStore} = ffux

const Todos = createStore({
  actions: ['createItem'],
  state: (items, {createItem}, {filter}) => {
    const itemsP = createItem.scan(items, (todos, newTodo) => [...todos, {text: newTodo}])

    return Bacon
      .combineTemplate({items: itemsP, filter: filter})
      .map(({items, filter}) => items.filter(it => isDisplayable(it, filter)))

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

const TodosApp = React.createClass({
  render() {
    const {newTodo, items, filter} = this.props.state
    const {resetFilter, setNewTodoText, createItem} = this.props.actions
    return (
      <div>
        <h1>TodoManager</h1>
        <input placeholder="Filter items.."
               value={filter}
               onChange={e => resetFilter(e.target.value)}
               />
        <ul>{_.map(items, it => <li>{it.text}</li>)}</ul>
        <input placeholder="New item.."
               value={newTodo}
               onChange={e => setNewTodoText(e.target.value)}
               onKeyDown={handleCreateItem}
               />
      </div>
    )

    function handleCreateItem(e) {
      if (e.which === 13) {
        createItem(newTodo)
        setNewTodoText("")
      }
    }
  }
})

const App = React.createClass({
  getDispatcher(state = {}) {
    const filter  = Filter(state.filter || "")
    const items   = Todos(state.items || [], {filter})
    const newTodo = NewTodo(state.newTodo || "")

    return ffux({filter, items, newTodo}, {flatActions: true})
  },

  render() {
    return (
      <Listener dispatcher={this.getDispatcher}>
        <TodosApp />
      </Listener>
    )
  }
})

React.render(<App />, document.getElementById("app"))
