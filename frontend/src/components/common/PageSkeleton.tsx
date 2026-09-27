import { Skeleton } from "./Brand";

/** Loading placeholder that mirrors a typical page: header, hero card and list rows. */
export function PageSkeleton() {
  return (
    <div className="space-y-4 px-5 pt-4" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-36 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Error with retry, used when a simulated request fails (for example while offline). */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card flex flex-col items-center px-6 py-8 text-center" role="alert">
      <p className="text-[15px] font-bold text-ink">{message}</p>
      <p className="mt-1 text-[13px] text-ink-muted">Check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-10 items-center rounded-xl bg-navy px-5 text-[13px] font-semibold text-white hover:bg-navy-800"
      >
        Retry
      </button>
    </div>
  );
}
