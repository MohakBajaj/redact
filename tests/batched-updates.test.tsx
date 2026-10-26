import { expect, it } from 'vitest'
import { useState } from 'react'
import ReactDOM, { flushSync, unstable_batchedUpdates } from 'react-dom'
import { createRoot } from 'react-dom/client'

it('passes its second argument to the callback and returns the result, like React', () => {
  expect(unstable_batchedUpdates((value: number) => value * 2, 21)).toBe(42)
  expect(ReactDOM.unstable_batchedUpdates((event: { clientX: number }) => event.clientX, { clientX: 7 })).toBe(7)
})

it('batches state updates made with the forwarded argument', () => {
  let renders = 0
  let set!: (value: number) => void
  function App() {
    const [value, setValue] = useState(0)
    set = setValue
    renders++
    return <b>{value}</b>
  }
  const container = document.createElement('div'), root = createRoot(container)
  flushSync(() => root.render(<App />))
  const before = renders
  // Libraries such as Excalidraw wrap event handlers this way: batchedUpdates(handler, event).
  unstable_batchedUpdates((event: { value: number }) => { set(event.value); set(event.value + 1) }, { value: 5 })
  expect(container.textContent).toBe('6')
  expect(renders).toBe(before + 1)
  root.unmount()
})
