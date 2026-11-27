import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toast, toastStore } from './toast.store'

const messages = () => toastStore.getState().toasts.map((item) => item.message)

describe('toast store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    toastStore.setState({ toasts: [] })
  })
  afterEach(() => vi.useRealTimers())

  it('queues toasts through the imperative toast() helper, keeping the action', () => {
    const onClick = vi.fn()
    toast('Added to cart', { label: 'View cart', onClick })
    expect(toastStore.getState().toasts).toEqual([
      expect.objectContaining({ message: 'Added to cart', action: { label: 'View cart', onClick } }),
    ])
  })

  it('keeps at most 3 on screen, newest last', () => {
    for (const message of ['1', '2', '3', '4']) toast(message)
    expect(messages()).toEqual(['2', '3', '4'])
  })

  it('auto-dismisses after the duration (3.5s by default) and can be dismissed early', () => {
    toast('first')
    toastStore.getState().show({ message: 'short' }, 1000)
    vi.advanceTimersByTime(1000)
    expect(messages()).toEqual(['first'])

    const { id } = toastStore.getState().toasts[0]!
    toastStore.getState().dismiss(id)
    expect(messages()).toEqual([])
  })

  it('removes the default-duration toast after 3.5s', () => {
    toast('bye')
    vi.advanceTimersByTime(3499)
    expect(messages()).toEqual(['bye'])
    vi.advanceTimersByTime(1)
    expect(messages()).toEqual([])
  })
})
