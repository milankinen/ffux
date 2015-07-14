const React = require("react")
const {merge} = require("./util")

export class Listener extends React.Component {
  constructor(props) {
    super(props)
    const {dispatcher, initialState} = this.props
    const ffux = dispatcher(initialState)

    this.state = {
      ffux,
      model: {
        state: ffux.getInitialState(),
        actions: ffux.getActions()
      }
    }
  }

  componentWillMount() {
    this.setState(merge(this.state, {
      stop: this.state.ffux.listen(model => this.setState(merge(this.state, {model})))
    }))
  }

  componentWillReceiveProps(nextProps) {
    const {dispatcher}   = nextProps
    const prevDispatcher = this.state.dispatcher
    if (dispatcher !== prevDispatcher) {
      if (this.state.stop) {
        this.state.stop()
      }
      const ffux = dispatcher(this.state.model.state)
      this.setState(merge(this.state, {
        ffux,
        dispatcher,
        stop: ffux.listen(model => this.setState(merge(this.state, {model})))
      }))
    }
  }

  render() {
    return React.cloneElement(this.props.children, this.state.model)
  }
}
