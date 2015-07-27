const React = require("react")


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
    this.setState({
      stop: this.state.ffux.listen(model => this.setState({model}))
    })
  }

  componentWillReceiveProps(nextProps) {
    const {dispatcher}   = nextProps
    const prevDispatcher = this.state.dispatcher
    if (dispatcher !== prevDispatcher) {
      if (this.state.stop) {
        this.state.stop()
      }
      const ffux = dispatcher(this.state.model.state)
      this.setState({
        ffux,
        dispatcher,
        stop: ffux.listen(model => this.setState({model}))
      })
    }
  }

  render() {
    return React.cloneElement(this.props.children, this.state.model)
  }
}
