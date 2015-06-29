const React = require("react")


export default React.createClass({
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
        <ul>{items.filter(it => it.display).map(it => <li>{it.text}</li>)}</ul>
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
