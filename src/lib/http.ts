/** Error carrying the HTTP status so callers (and React Query retry) can branch on it. */
export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }

  get isNotFound() {
    return this.status === 404
  }
}

const DEFAULT_TIMEOUT_MS = 10_000

/** `AbortSignal.any` is recent (Safari 17.4, Firefox 124) — fall back to a manual combiner. */
function anySignal(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals)
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      break
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }
  return controller.signal
}

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms)
  const controller = new AbortController()
  setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), ms)
  return controller.signal
}

/**
 * Thin `fetch` wrapper: JSON parsing, typed HTTP errors and a timeout that is
 * combined with the caller's AbortSignal (React Query cancels on unmount).
 */
export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const timeout = timeoutSignal(DEFAULT_TIMEOUT_MS)
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: signal ? anySignal([signal, timeout]) : timeout,
  })

  if (!response.ok) {
    throw new HttpError(response.status, `Request failed with status ${response.status}`)
  }
  return (await response.json()) as T
}
