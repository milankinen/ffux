const React = require("react"),
      Rx    = require("rx"),
      ffux  = require("ffux/rx"),
      _     = require("lodash")

const {Listener} = require("ffux/react")
const {createStore} = ffux

const Todos = createStore({
  actions: ['createItem'],
  state: (items, {createItem}, {filter}) => {
    const itemsS = createItem
      .scan(items, (todos, newTodo) => [...todos, {text: newTodo}])
      .startWith(items)

    return Rx.Observable.combineLatest(itemsS, filter,
      (items, f) => items.filter(it => isDisplayable(it, f)))

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
