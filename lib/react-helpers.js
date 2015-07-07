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
    this.state.stop = this.state.ffux.listen(model => this.setState(merge(this.state, {model})))
  }

  componentWillReceiveProps(nextProps) {
    const {dispatcher} = nextProps
    if (this.state.stop) {
      this.state.stop()
    }
    const ffux = dispatcher(this.state.model.state)
    this.state.stop = ffux.listen(model => this.setState(merge(this.state, {model})))
  }

  render() {
    return React.cloneElement(this.props.children, this.state.model)
  }
}
