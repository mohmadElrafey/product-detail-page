import { useToastStore } from './toast.store'
import { Icon } from './Icon'

/**
 * Renders queued toasts inside a polite live region, so screen readers announce
 * "Added to cart" without moving focus away from the button the user pressed.
 */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-8"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm animate-slide-in-up items-center gap-3 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <Icon name="check" size={18} className="shrink-0 text-success" />
          <span className="flex-1">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className="shrink-0 underline underline-offset-2 hover:text-dot"
              onClick={() => {
                toast.action?.onClick()
                dismiss(toast.id)
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
