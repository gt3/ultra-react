import React, { Component, createElement } from 'react'
import PropTypes from 'prop-types'
import { render } from 'react-dom'
import { spec, check, match, prefixMatch, appendPath, parseQS } from 'ultra'
import { A } from '../../src'

function pipe(...fns) {
  function invoke(v) {
    return fns.reduce((acc, fn) => (fn ? fn.call(this, acc) : acc), v)
  }
  return invoke
}

let createMatch = (select, mountPath) => {
  let transform = ({ values: [x] }) => ({ x })
  return [prefixMatch(mountPath, match(spec('/:x')(pipe(transform, select))))]
}

class App extends Component {
  constructor(props, ctx) {
    super(props, ctx)
    App.mountPath = props.mountPath
    this.state = { x: 1, tap: false }
    this.navigate = this.navigate.bind(this)
  }
  get ultra() { return this.context.getUltra() }
  get nextLink() {
    return `${App.mountPath}/${+this.state.x + 1}`
  }
  navigate() {
    return this.ultra.push(this.nextLink)
  }
  componentDidMount() {
    let matchers = createMatch(this.setState.bind(this), App.mountPath)
    this.remove = this.context.run(curr => [...matchers, ...curr], this.props.runUltra)
    this.interval = setInterval(this.navigate, 3000)
  }
  componentWillUnmount() {
    clearInterval(this.interval)
    this.remove()
  }
  confirm(ok, cancel) {
    return window.confirm('Are you sure you want to navigate away?') ? ok() : cancel()
  }
  render() {
    let { x, tap } = this.state
    let toggleTap = cb => () => this.setState(state => ({ tap: !state.tap }), cb)
    if (tap) this.ultra.tap((ok, cancel) => this.confirm(toggleTap(ok), cancel))
    else this.ultra.untap()
    return (
      <button onClick={toggleTap()}>
        {tap ? 'release' : 'tap'}: {x}
      </button>
    )
  }
}
App.contextTypes = { getUltra: PropTypes.func, run: PropTypes.func }
// export default (node, mountPath, services) => {
//   Object.assign(App, services, { mountPath })
//   let placeholder = toggle(emptyMatch, mountPath)
//   services.runUltra(curr => [...curr, placeholder])
//   //return (msg, cb) => render(<App />, node, cb)
//   return (msg, cb) =>
//     render(
//       <div>
//         <hr />
//         <div dangerouslySetInnerHTML={{ __html: readme }} />
//         <App />
//       </div>,
//       node,
//       cb
//     )
// }
export default (mountPath, msg) =>
  <div>
    <hr />
    <div dangerouslySetInnerHTML={{ __html: readme }} />
    <App mountPath={mountPath} runUltra={msg && msg.path !== mountPath} />
  </div>

var readme = require('./README.md')
