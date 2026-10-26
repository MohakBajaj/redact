import { expect, it } from 'vitest'
import { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

it('runs a setState callback after the update commits, not on unmount', () => {
  const log: string[] = []
  let instance!: Counter
  class Counter extends Component<{}, { value: number }> {
    state = { value: 0 }
    componentDidUpdate() { log.push('didUpdate') }
    render() { instance = this; return <b>{this.state.value}</b> }
  }
  const container = document.createElement('div'), root = createRoot(container)
  flushSync(() => root.render(<Counter />))
  flushSync(() => instance.setState({ value: 1 }, () => log.push(`callback ${container.textContent}`)))
  expect(log).toEqual(['didUpdate', 'callback 1'])
  root.unmount()
  expect(log).toEqual(['didUpdate', 'callback 1'])
})

it('runs a setState callback queued from componentDidMount', () => {
  const log: string[] = []
  class Loader extends Component<{}, { width: number; loading: boolean }> {
    state = { width: 0, loading: true }
    componentDidMount() {
      // The pattern Excalidraw uses: measure, then initialize from the callback.
      this.setState({ width: 100 }, () => {
        log.push(`measured ${this.state.width}`)
        this.setState({ loading: false })
      })
    }
    render() { return <b>{this.state.loading ? 'loading' : `ready ${this.state.width}`}</b> }
  }
  const container = document.createElement('div'), root = createRoot(container)
  flushSync(() => root.render(<Loader />))
  expect(log).toEqual(['measured 100'])
  expect(container.textContent).toBe('ready 100')
  root.unmount()
})

it('runs batched setState and forceUpdate callbacks once each, in call order', () => {
  const log: string[] = []
  let instance!: Counter
  class Counter extends Component<{}, { value: number }> {
    state = { value: 0 }
    render() { instance = this; return <b>{this.state.value}</b> }
  }
  const container = document.createElement('div'), root = createRoot(container)
  flushSync(() => root.render(<Counter />))
  flushSync(() => {
    instance.setState({ value: 1 }, () => log.push(`first ${instance.state.value}`))
    instance.setState({ value: 2 }, () => log.push(`second ${instance.state.value}`))
    instance.forceUpdate(() => log.push('forced'))
  })
  expect(log).toEqual(['first 2', 'second 2', 'forced'])
  flushSync(() => instance.setState({ value: 3 }))
  expect(log).toEqual(['first 2', 'second 2', 'forced'])
  root.unmount()
})

it('runs a setState callback even when shouldComponentUpdate skips the render', () => {
  const log: string[] = []
  let instance!: Frozen
  class Frozen extends Component<{}, { value: number }> {
    state = { value: 0 }
    shouldComponentUpdate() { return false }
    render() { instance = this; return <b>{this.state.value}</b> }
  }
  const container = document.createElement('div'), root = createRoot(container)
  flushSync(() => root.render(<Frozen />))
  flushSync(() => instance.setState({ value: 1 }, () => log.push(`callback ${instance.state.value}`)))
  expect(log).toEqual(['callback 1'])
  expect(container.textContent).toBe('0')
  root.unmount()
})
