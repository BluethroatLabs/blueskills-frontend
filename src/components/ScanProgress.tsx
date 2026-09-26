import { type ScanProgressState } from '@/hooks/use-blueskills-scan'

export const ScanProgress = ({ progress }: { progress: ScanProgressState }) => {
  return (
    <section
      aria-labelledby="scan-progress-heading"
      className="border border-(--rule) bg-(--panel)"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--rule) px-4 py-3 sm:px-5">
        <h2
          id="scan-progress-heading"
          className="font-serif text-2xl leading-none font-normal"
        >
          Scan in progress
        </h2>
        <span className="text-xs tracking-[0.04em] text-(--ink-3) uppercase">
          {progress.status.replaceAll('_', ' ')}
        </span>
      </header>
      <dl className="grid bg-(--panel-2) sm:grid-cols-2">
        <div className="min-w-0 px-4 py-3 sm:border-r sm:border-(--rule) sm:px-5">
          <dt className="text-xs text-(--ink-3)">Submitted</dt>
          <dd className="mt-1 text-sm wrap-anywhere">
            {progress.snapshot.source}
          </dd>
        </div>
        <div className="border-t border-(--rule) px-4 py-3 sm:border-t-0 sm:px-5">
          <dt className="text-xs text-(--ink-3)">Kind</dt>
          <dd className="mt-1 text-sm">{progress.snapshot.kind}</dd>
        </div>
      </dl>
      <div className="border-t border-(--rule) p-4 sm:p-5">
        <p className="font-medium" aria-live="polite">
          {progress.connectionPaused
            ? 'Waiting for the connection to return'
            : progress.label}
        </p>
        <p className="mt-1 max-w-[75ch] text-sm text-(--ink-3)">
          This submitted source record stays fixed while you edit the form
          above.
        </p>
        <div
          className="mt-4 h-1 overflow-hidden bg-(--panel-2)"
          aria-hidden="true"
        >
          <div className="blueskills-progress h-full w-1/3 bg-(--ink)" />
        </div>
      </div>
    </section>
  )
}
