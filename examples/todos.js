const React = require("react"),
      Bacon = require("baconjs"),
      ffux  = require("../ffux"),
      _     = require("lodash")

const {createStore} = ffux

const Todos = createStore({
  actions: ['createItem'],
  state: ({items}, {createItem}, {filter}) => {
    const itemsP = createItem.scan(items, (todos, newTodo) => [...todos, {text: newTodo}])

    return Bacon
      .combineTemplate({items: itemsP, filter: filter.state()})
      .map(({items, filter}) => items.filter(it => isDisplayable(it, filter)))

    function isDisplayable(item, filter) {
      return item.text.toLowerCase().indexOf(filter.toLowerCase()) !== -1
    }
  }
})

const NewTodo = createStore({
  actions: ['setNewTodoText'],
  state: ({newTodoText}, {setNewTodoText}) => {
    return setNewTodoText.scan(newTodoText || "", (_, newText) => newText)
  }
})

const Filter = createStore({
  actions: ['resetFilter'],
  state: ({filter}, {resetFilter}) => {
    return resetFilter.scan(filter || "", (_, newFilter) => newFilter)
  }
})


const App = React.createClass({
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

;(function() {
  const filter  = Filter()
  const items   = Todos({filter})
  const newTodo = NewTodo()

  ffux({filter, items, newTodo}, {items: []})
    .listen((model) => {
      React.render(<App {...model} />, document.getElementById("app"))
    })
})()
