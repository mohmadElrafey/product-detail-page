import { Button } from '../../../components/ui/Button'
import { Skeleton } from '../../../components/ui/Skeleton'
import { HttpError } from '../../../lib/http'

/** Mirrors the real layout box-for-box so nothing jumps when data arrives (no CLS). */
export function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="page-container">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,545px)_minmax(0,520px)] lg:justify-between lg:gap-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 lg:gap-[35px]">
          <Skeleton className="aspect-[458/610]" />
          <div className="flex flex-col gap-5">
            <Skeleton className="size-11 lg:size-[52px]" />
            <Skeleton className="size-11 lg:size-[52px]" />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-6 h-24 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-6 h-[58px] w-full" />
        </div>
      </div>
    </div>
  )
}

interface ProductErrorProps {
  error: Error
  retrying: boolean
  onRetry: () => void
}

export function ProductError({ error, retrying, onRetry }: ProductErrorProps) {
  const notFound = error instanceof HttpError && error.isNotFound
  return (
    <div role="alert" className="page-container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-heading lg:text-4xl">
        {notFound ? 'Product not found' : 'We couldn’t load this product'}
      </h1>
      <p className="max-w-md text-base text-body">
        {notFound
          ? 'It may have been removed or the link is incorrect.'
          : 'Please check your connection and try again.'}
      </p>
      {notFound ? (
        <a href="/" className="text-base font-medium underline">
          Back to homepage
        </a>
      ) : (
        <Button onClick={onRetry} disabled={retrying} aria-busy={retrying} className="h-12 lg:h-12 lg:text-base">
          {retrying ? 'Retrying…' : 'Try again'}
        </Button>
      )}
    </div>
  )
}
