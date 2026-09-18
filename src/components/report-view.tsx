'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
  ApiFinding,
  NormalizedReport,
  OperationalReport,
  ReportState,
  ScanUnit,
} from '@/lib/blueskills'
import { verdictTone } from '@/lib/blueskills'

interface ReportViewProps {
  state: ReportState
  onRetry?: () => void
  onChooseSource?: () => void
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function toneFrameClasses(verdict: string) {
  switch (verdictTone(verdict)) {
    case 'clean':
      return 'border-[var(--clean-border)]'
    case 'suspicious':
      return 'border-[var(--suspicious-border)]'
    case 'malicious':
      return 'border-[var(--malicious-border)]'
    default:
      return 'border-[var(--neutral-border)]'
  }
}

function toneSurfaceClasses(verdict: string) {
  switch (verdictTone(verdict)) {
    case 'clean':
      return 'bg-[var(--clean-bg)]'
    case 'suspicious':
      return 'bg-[var(--suspicious-bg)]'
    case 'malicious':
      return 'bg-[var(--malicious-bg)]'
    default:
      return 'bg-[var(--neutral-bg)]'
  }
}

function toneBadgeClasses(verdict: string) {
  switch (verdictTone(verdict)) {
    case 'clean':
      return 'border-[var(--clean-fg)] text-[var(--clean-fg)]'
    case 'suspicious':
      return 'border-[var(--suspicious-fg)] text-[var(--suspicious-fg)]'
    case 'malicious':
      return 'border-[var(--malicious-fg)] text-[var(--malicious-fg)]'
    default:
      return 'border-[var(--neutral-fg)] text-[var(--neutral-fg)]'
  }
}

function severityFrameClasses(severity: string) {
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    return 'border-[var(--malicious-border)]'
  }
  if (severity === 'MEDIUM') {
    return 'border-[var(--suspicious-border)]'
  }
  return 'border-[var(--rule)]'
}

function severitySurfaceClasses(severity: string) {
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    return 'bg-[var(--malicious-bg)]'
  }
  if (severity === 'MEDIUM') {
    return 'bg-[var(--suspicious-bg)]'
  }
  return 'bg-[var(--panel-2)]'
}

function severityBadgeClasses(severity: string) {
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    return 'border-[var(--malicious-fg)] text-[var(--malicious-fg)]'
  }
  if (severity === 'MEDIUM') {
    return 'border-[var(--suspicious-fg)] text-[var(--suspicious-fg)]'
  }
  return 'border-[var(--rule)] text-[var(--ink-2)]'
}

function VerdictMark({ verdict }: { verdict: string }) {
  const tone = verdictTone(verdict)
  if (tone === 'malicious') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-4 w-4"
        fill="none"
      >
        <rect x="4" y="4" width="8" height="8" fill="currentColor" />
      </svg>
    )
  }
  if (tone === 'suspicious') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-4 w-4"
        fill="none"
      >
        <path d="M8 2l6 11H2L8 2z" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 5.5v3.8M8 11.2v.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }
  if (tone === 'clean') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-4 w-4"
        fill="none"
      >
        <circle
          cx="8"
          cy="8"
          r="4.75"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <rect
        x="3"
        y="3"
        width="10"
        height="10"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function nextAction(verdict: string) {
  switch (verdict) {
    case 'MALICIOUS':
      return 'Do not install this package.'
    case 'SUSPICIOUS':
      return 'Review the quoted evidence before installing.'
    case 'PARTIAL':
      return 'Treat this as a floor, not a complete result.'
    case 'CLEAN':
      return 'Nothing was flagged in this scan. This is not a safety certificate.'
    case 'INVALID':
      return 'No security verdict was produced.'
    default:
      return 'Review the report and its coverage before acting.'
  }
}

function SourceRecord({ report }: { report: NormalizedReport }) {
  const rows = [
    ['Submitted', report.snapshot.source],
    ['Kind', report.snapshot.kind],
    ['Scope', report.source.scope],
    ['Commit', report.source.commit],
    ['Reference', report.scanId],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return (
    <section className="border border-(--rule) bg-(--panel)">
      <p className="border-b border-(--rule) px-3 py-2 text-sm tracking-[0.06em] text-(--ink-2) uppercase">
        Source record
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4">
        {rows.map(([term, description]) => (
          <div
            key={term}
            className="col-span-2 grid min-w-0 grid-cols-subgrid border-b border-(--rule) px-3 py-2"
          >
            <dt className="text-sm whitespace-nowrap text-(--ink-3)">{term}</dt>
            <dd className="min-w-0 text-sm wrap-anywhere">{description}</dd>
          </div>
        ))}
      </dl>
      <p className="px-3 py-2 text-sm text-pretty text-(--ink-3)">
        Editing the form above does not change this submitted source record.
      </p>
    </section>
  )
}

function CoverageWarning({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null
  return (
    <section
      aria-labelledby="coverage-warning-heading"
      className="coverage-hatch border border-(--rule-2) bg-(--neutral-bg) px-3 py-3"
    >
      <h3
        id="coverage-warning-heading"
        className="font-medium text-(--neutral-fg)"
      >
        Coverage is incomplete
      </h3>
      <ul className="mt-1.5 space-y-1.5 pl-5 text-sm text-pretty text-(--ink-2)">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  )
}

function ResultSummary({
  report,
  onViewFinding,
}: {
  report: NormalizedReport
  onViewFinding: (() => void) | null
}) {
  const countCells = [
    report.counts.skillsFound === null
      ? null
      : ['Skills found', String(report.counts.skillsFound)],
    ['Skills scanned', String(report.counts.skillsScanned)],
    ['Loose-file units', String(report.counts.looseFileUnits)],
    report.counts.notScanned === null
      ? null
      : ['Not scanned', String(report.counts.notScanned)],
  ].filter((cell): cell is string[] => cell !== null)

  const verdictCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const unit of report.units) {
      counts.set(unit.verdict, (counts.get(unit.verdict) || 0) + 1)
    }
    return [...counts.entries()]
  }, [report.units])

  return (
    <section
      className={cx('border bg-(--panel)', toneFrameClasses(report.verdict))}
    >
      <div
        className={cx(
          'border-b p-3.5 sm:p-4',
          toneFrameClasses(report.verdict),
          toneSurfaceClasses(report.verdict)
        )}
      >
        <p className="text-sm tracking-[0.06em] text-(--ink-2) uppercase">
          {report.snapshot.mode === 'paste' ? 'Skill result' : 'Package result'}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3.5 gap-y-2">
          <div
            className={cx(
              'inline-flex items-center gap-2 border px-2.5 py-1.5 text-[15px] font-semibold tracking-[0.08em]',
              toneBadgeClasses(report.verdict)
            )}
          >
            <VerdictMark verdict={report.verdict} />
            {report.verdict}
          </div>
          <p className="min-w-0 text-lg font-medium text-pretty text-(--ink)">
            {nextAction(report.verdict)}
          </p>
        </div>
        {onViewFinding && (
          <button
            type="button"
            onClick={onViewFinding}
            className="mt-3 min-h-11 border border-(--rule-2) px-3 py-2 text-[15px] transition-colors hover:bg-(--panel-2)"
          >
            View{' '}
            {report.units.reduce(
              (sum, unit) => sum + unit.findings.length,
              0
            ) === 1
              ? 'finding'
              : 'findings'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 p-3.5 sm:p-4">
        <CoverageWarning warnings={report.coverageWarnings} />

        <div className="grid grid-cols-2 gap-px border border-(--rule) bg-(--rule) sm:grid-cols-4">
          {countCells.map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 bg-(--panel) px-3 py-2.5 tabular-nums"
            >
              <p className="text-sm text-pretty text-(--ink-3)">{label}</p>
              <p className="mt-0.5 text-base font-medium wrap-anywhere">
                {value}
              </p>
            </div>
          ))}
        </div>

        {verdictCounts.length > 0 && (
          <p className="text-sm text-pretty text-(--ink-3)">
            By returned unit:{' '}
            {verdictCounts
              .map(([verdict, count]) => `${count} ${verdict}`)
              .join(', ')}
            . Loose files are counted separately from named skills.
          </p>
        )}
      </div>
    </section>
  )
}

function FindingCard({
  finding,
  index,
}: {
  finding: ApiFinding
  index: number
}) {
  const [wrap, setWrap] = useState(false)
  const location = [finding.file, finding.line ? `line ${finding.line}` : null]
    .filter(Boolean)
    .join(', ')

  return (
    <article
      className={cx(
        'border bg-(--panel)',
        severityFrameClasses(finding.severity)
      )}
    >
      <div
        className={cx(
          'flex flex-wrap items-baseline gap-x-3 gap-y-2 border-b px-3 py-2.5',
          severityFrameClasses(finding.severity),
          severitySurfaceClasses(finding.severity)
        )}
      >
        <span
          className={cx(
            'border px-2 py-0.5 text-sm font-semibold tracking-[0.08em]',
            severityBadgeClasses(finding.severity)
          )}
        >
          {finding.severity}
        </span>
        <h4 className="min-w-55 flex-1 text-base font-medium text-pretty">
          {finding.title}
        </h4>
        {finding.layer && (
          <span className="border border-(--rule) bg-(--panel) px-2 py-0.5 text-xs text-(--ink-2)">
            {finding.layer}
          </span>
        )}
        {finding.ruleId && (
          <code className="text-xs text-(--ink-3)">{finding.ruleId}</code>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {finding.detail && (
          <p className="max-w-[75ch] text-sm text-pretty text-(--ink-2)">
            {finding.detail}
          </p>
        )}
        {(location || finding.reach) && (
          <dl className="mt-3 flex flex-wrap gap-2 text-sm text-(--ink-2)">
            {location && (
              <div className="border border-(--rule) px-2 py-1">
                <dt className="sr-only">Location</dt>
                <dd>{location}</dd>
              </div>
            )}
            {finding.reach && (
              <div className="border border-(--rule-2) px-2 py-1 font-medium text-(--ink)">
                <dt className="sr-only">Execution reach</dt>
                <dd>{finding.reach}</dd>
              </div>
            )}
          </dl>
        )}

        {finding.evidence ? (
          <div className="mt-4 border border-(--rule) bg-(--code)">
            <div className="flex items-center justify-between gap-3 border-b border-(--rule) px-3 py-2">
              <span className="text-sm text-(--ink-3)">Quoted evidence</span>
              <button
                type="button"
                aria-pressed={wrap}
                aria-label={`${wrap ? 'Stop wrapping' : 'Wrap'} evidence lines for ${finding.severity.toLowerCase()} finding ${index + 1}`}
                onClick={() => setWrap((value) => !value)}
                className="min-h-10 border border-(--rule) px-2.5 text-sm transition-colors hover:bg-(--panel)"
              >
                {wrap ? 'Scroll lines' : 'Wrap lines'}
              </button>
            </div>
            <pre
              className={cx(
                'max-w-full overflow-x-auto p-3 text-sm leading-6 text-(--ink)',
                wrap && 'wrap-break-word whitespace-pre-wrap'
              )}
            >
              <code>{finding.evidence}</code>
            </pre>
          </div>
        ) : (
          <p className="mt-3 text-xs text-(--ink-3)">
            No quoted evidence or source location was returned for this finding.
          </p>
        )}
      </div>
    </article>
  )
}

function TechnicalDetails({ unit }: { unit: ScanUnit }) {
  const hasDetails =
    unit.inventory.length > 0 ||
    unit.layersRun.length > 0 ||
    unit.stages.length > 0 ||
    unit.loadWarnings.length > 0 ||
    unit.layerErrors.length > 0 ||
    unit.remoteIngress.length > 0 ||
    unit.installEntrypoints.length > 0 ||
    unit.provenance ||
    unit.analyzedAt ||
    unit.analyzerVersion ||
    unit.rulesetVersion

  if (!hasDetails) return null

  return (
    <details className="group border border-(--rule)">
      <summary className="flex min-h-11 list-none items-center justify-between gap-3 bg-(--panel-2) px-3 py-2.5 text-[15px] transition-colors hover:bg-(--panel)">
        <span>Inventory, analysis layers and provenance</span>
        <span className="text-sm text-(--ink-3) group-open:hidden">Show</span>
        <span className="hidden text-sm text-(--ink-3) group-open:inline">
          Hide
        </span>
      </summary>
      <div className="space-y-4 border-t border-(--rule) bg-(--panel-2) p-3 text-sm sm:p-4">
        {unit.stages.length > 0 && (
          <div>
            <h4 className="font-medium">Analysis stages</h4>
            <ul className="mt-2 space-y-1.5">
              {unit.stages.map((stage) => (
                <li
                  key={`${stage.name}-${stage.status}`}
                  className="text-(--ink-2)"
                >
                  <span className="font-medium text-(--ink)">
                    {stage.name.replaceAll('_', ' ')}
                  </span>{' '}
                  — {stage.status.replaceAll('_', ' ')}
                  {stage.error ? `: ${stage.error}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {unit.layersRun.length > 0 && (
          <div>
            <h4 className="font-medium">Layers run</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {unit.layersRun.map((layer) => (
                <span
                  key={layer}
                  className="border border-(--rule) bg-(--panel) px-2 py-1 text-xs"
                >
                  {layer}
                </span>
              ))}
            </div>
          </div>
        )}

        {unit.inventory.length > 0 && (
          <div>
            <h4 className="font-medium">Inventory</h4>
            <ul className="mt-2 space-y-1.5">
              {unit.inventory.map((item) => (
                <li
                  key={`${item.path}-${item.sha256}`}
                  className="break-all text-(--ink-2)"
                >
                  <code>{item.path}</code>
                  {item.analyzed === false && (
                    <span> — {item.skipReason || 'not analyzed'}</span>
                  )}
                  {item.sha256 && (
                    <span className="text-(--ink-3)">
                      {' '}
                      · {item.sha256.slice(0, 12)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {unit.installEntrypoints.length > 0 && (
          <div>
            <h4 className="font-medium">Install-time entrypoints</h4>
            <ul className="mt-2 space-y-1.5">
              {unit.installEntrypoints.map((entry) => (
                <li key={entry.path} className="text-(--ink-2)">
                  <code>{entry.path}</code> — {entry.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {unit.remoteIngress.length > 0 && (
          <div>
            <h4 className="font-medium">Uninspected remote instructions</h4>
            <p className="mt-1 text-xs text-(--ink-3)">
              These are inert addresses reported by the scanner. Their contents
              were not inspected.
            </p>
            <ul className="mt-2 space-y-1.5">
              {unit.remoteIngress.map((address) => (
                <li key={address} className="wrap-anywhere break-all">
                  <code>{address}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(unit.loadWarnings.length > 0 || unit.layerErrors.length > 0) && (
          <div>
            <h4 className="font-medium">Load and layer notes</h4>
            <ul className="mt-2 space-y-1.5 pl-5 text-(--ink-2)">
              {[...unit.loadWarnings, ...unit.layerErrors].map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {(unit.provenance ||
          unit.analyzedAt ||
          unit.analyzerVersion ||
          unit.rulesetVersion) && (
          <dl className="grid gap-2 border-t border-(--rule) pt-3 sm:grid-cols-2">
            {unit.provenance && (
              <div>
                <dt className="text-xs text-(--ink-3)">Provenance</dt>
                <dd>{unit.provenance}</dd>
              </div>
            )}
            {unit.analyzedAt && (
              <div>
                <dt className="text-xs text-(--ink-3)">Analyzed</dt>
                <dd>{unit.analyzedAt}</dd>
              </div>
            )}
            {unit.analyzerVersion && (
              <div>
                <dt className="text-xs text-(--ink-3)">Analyzer</dt>
                <dd>{unit.analyzerVersion}</dd>
              </div>
            )}
            {unit.rulesetVersion && (
              <div>
                <dt className="text-xs text-(--ink-3)">Ruleset</dt>
                <dd>{unit.rulesetVersion}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </details>
  )
}

function JudgeReview({ unit }: { unit: ScanUnit }) {
  if (!unit.judge) return null
  const judge = unit.judge
  return (
    <details className="group border border-(--rule)">
      <summary className="flex min-h-11 list-none items-center justify-between gap-3 bg-(--panel-2) px-3 py-2.5 text-[15px] transition-colors hover:bg-(--panel)">
        <span>AI review (secondary)</span>
        <span className="text-sm text-(--ink-3) group-open:hidden">Show</span>
        <span className="hidden text-sm text-(--ink-3) group-open:inline">
          Hide
        </span>
      </summary>
      <div className="border-t border-(--rule) p-3 sm:p-4">
        <dl className="grid border border-(--rule) sm:grid-cols-2">
          <div className="p-3 sm:border-r sm:border-(--rule)">
            <dt className="text-xs text-(--ink-3)">Enforced result</dt>
            <dd className="mt-1 font-semibold">{judge.enforcedVerdict}</dd>
          </div>
          <div className="border-t border-(--rule) p-3 sm:border-t-0">
            <dt className="text-xs text-(--ink-3)">AI proposal</dt>
            <dd className="mt-1">{judge.proposedVerdict || 'Not returned'}</dd>
          </div>
        </dl>
        {judge.reasoning && (
          <p className="mt-3 max-w-[75ch] text-sm text-pretty text-(--ink-2)">
            {judge.reasoning}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-(--ink-3)">
          {judge.confidence !== null && (
            <span>Confidence: {judge.confidence}</span>
          )}
          {judge.action && <span>Action: {judge.action}</span>}
          {judge.model && <span>Model: {judge.model}</span>}
        </div>
        {judge.overrideReason && (
          <p className="coverage-hatch mt-3 border border-(--neutral-border) bg-(--neutral-bg) p-3 text-sm">
            BlueSkills kept the enforced result: {judge.overrideReason}
          </p>
        )}
        {judge.truncated && (
          <p className="mt-3 text-sm text-(--ink-2)">
            The reviewer received a truncated copy because the skill exceeded
            its input budget.
          </p>
        )}
      </div>
    </details>
  )
}

function UnitReport({
  unit,
  open,
  onToggle,
}: {
  unit: ScanUnit
  open: boolean
  onToggle: () => void
}) {
  const evidenceHeadingId = `${unit.id}-evidence`
  const severityCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const finding of unit.findings) {
      counts.set(finding.severity, (counts.get(finding.severity) || 0) + 1)
    }
    return [...counts.entries()]
  }, [unit.findings])
  const failedStages = unit.stages.filter(
    (stage) => stage.status === 'failed' || stage.status === 'skipped_budget'
  )
  const intentionalSkips = unit.stages.filter(
    (stage) =>
      stage.status.startsWith('skipped_') && stage.status !== 'skipped_budget'
  )
  const unitMeta = unit.isPackage
    ? unit.fileCount === null
      ? 'files outside any skill'
      : `${unit.fileCount} file${unit.fileCount === 1 ? '' : 's'} no skill folder claims`
    : unit.path
  const statCells = [
    unit.fileCount === null
      ? null
      : ['Files inspected', String(unit.fileCount)],
    unit.scored && unit.riskScore !== null
      ? ['Risk score', `${unit.riskScore}/100`]
      : null,
    ['Findings', String(unit.findings.length)],
    unit.referencedCount === null
      ? null
      : ['Referenced files', String(unit.referencedCount)],
  ].filter((cell): cell is string[] => cell !== null)

  return (
    <article
      id={unit.id}
      className={cx('border bg-(--panel)', toneFrameClasses(unit.verdict))}
    >
      <div
        className={cx(
          'flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between',
          toneSurfaceClasses(unit.verdict)
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-2">
          <span
            className={cx(
              'inline-flex border px-2.5 py-1 text-sm font-semibold tracking-[0.08em]',
              toneBadgeClasses(unit.verdict)
            )}
          >
            {unit.verdict}
          </span>
          <span className="font-medium">{unit.name}</span>
          {unitMeta && (
            <code className="min-w-0 text-sm wrap-anywhere text-(--ink-3)">
              {unitMeta}
            </code>
          )}
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${unit.id}-body`}
          aria-label={`${open ? 'Collapse' : 'Expand'} report for ${unit.name}`}
          onClick={onToggle}
          className="min-h-11 shrink-0 self-start border border-(--rule-2) px-3 py-2 text-sm transition-colors hover:bg-(--panel-2) sm:self-auto"
        >
          {open ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {open && (
        <div
          id={`${unit.id}-body`}
          className={cx(
            'border-t bg-(--panel)',
            toneFrameClasses(unit.verdict)
          )}
        >
          <div className="flex flex-col gap-3.5 p-3.5 sm:p-4">
            <p className="text-[17px] font-medium text-pretty">
              {nextAction(unit.verdict)}
            </p>

            {(unit.incomplete ||
              unit.missingLayers.length > 0 ||
              unit.unscannedMembers.length > 0 ||
              failedStages.length > 0) && (
              <div className="coverage-hatch border border-(--rule-2) bg-(--neutral-bg) p-3 text-sm">
                <p className="font-medium">
                  This unit has incomplete coverage.
                </p>
                {unit.missingLayers.length > 0 && (
                  <p className="mt-1 text-(--ink-2)">
                    Missing required layers: {unit.missingLayers.join(', ')}.
                  </p>
                )}
                {unit.unscannedMembers.length > 0 && (
                  <p className="mt-1 text-(--ink-2)">
                    Unscanned members: {unit.unscannedMembers.join(', ')}.
                  </p>
                )}
                {failedStages.map((stage) => (
                  <p
                    key={`${stage.name}-${stage.status}`}
                    className="mt-1 text-(--ink-2)"
                  >
                    {stage.name.replaceAll('_', ' ')} was{' '}
                    {stage.status.replaceAll('_', ' ')}
                    {stage.error ? `: ${stage.error}` : '.'}
                  </p>
                ))}
              </div>
            )}

            {intentionalSkips.length > 0 && (
              <details className="border-l-3 border-(--rule) py-1 pl-3 text-sm">
                <summary className="min-h-8 text-(--ink-2)">
                  Optional analysis intentionally skipped
                </summary>
                <ul className="mt-2 space-y-1 pl-5 text-(--ink-2)">
                  {intentionalSkips.map((stage) => (
                    <li key={`${stage.name}-${stage.status}`}>
                      {stage.name.replaceAll('_', ' ')} —{' '}
                      {stage.status.replaceAll('_', ' ')}
                      {stage.error ? `: ${stage.error}` : ''}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="grid grid-cols-2 gap-px border border-(--rule) bg-(--rule) sm:grid-cols-4">
              {statCells.map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 bg-(--panel) px-3 py-2.5 tabular-nums"
                >
                  <p className="text-sm text-(--ink-3)">{label}</p>
                  <p className="mt-0.5 font-medium wrap-anywhere">{value}</p>
                </div>
              ))}
            </div>

            {severityCounts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {severityCounts.map(([severity, count]) => (
                  <span
                    key={severity}
                    className={cx(
                      'border px-2 py-1 text-sm',
                      severityBadgeClasses(severity)
                    )}
                  >
                    {count} {severity.toLowerCase()}
                  </span>
                ))}
              </div>
            )}

            {unit.runtimeObservation && (
              <p className="text-sm text-pretty text-(--ink-2)">
                {unit.runtimeObservation}
              </p>
            )}

            {unit.findings.length > 0 ? (
              <section aria-labelledby={evidenceHeadingId}>
                <h3
                  id={evidenceHeadingId}
                  tabIndex={-1}
                  className="text-sm font-medium tracking-[0.06em] text-(--ink-2) uppercase"
                >
                  Findings and evidence
                </h3>
                <div className="mt-3 space-y-3">
                  {unit.findings.map((finding, index) => (
                    <FindingCard
                      key={`${unit.id}-${finding.ruleId}-${index}`}
                      finding={finding}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <div className="border border-dashed border-(--rule) p-3">
                <p>No findings were raised in this scan.</p>
                <p className="mt-1 text-sm text-pretty text-(--ink-2)">
                  No findings were returned for this unit. That describes this
                  scan only, not the skill’s safety.
                </p>
              </div>
            )}

            <JudgeReview unit={unit} />
            <TechnicalDetails unit={unit} />
          </div>
        </div>
      )}
    </article>
  )
}

function OperationalView({
  report,
  onRetry,
  onChooseSource,
}: {
  report: OperationalReport
  onRetry?: () => void
  onChooseSource?: () => void
}) {
  const [retryIn, setRetryIn] = useState(report.retryAfter || 0)

  useEffect(() => {
    if (!report.retryAfter) return
    const interval = window.setInterval(() => {
      setRetryIn((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval)
          return 0
        }
        return seconds - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [report.retryAfter])

  return (
    <section aria-labelledby="report-heading" className="flex flex-col gap-3.5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2
          id="report-heading"
          className="text-sm font-medium tracking-[0.06em] text-(--ink-2) uppercase"
        >
          Report
        </h2>
        <a
          href="https://bluethroatlabs.com"
          className="text-xs underline underline-offset-4"
        >
          BlueSkills · by Bluethroat Labs
        </a>
      </header>
      <div className="coverage-hatch border-b border-(--neutral-border) bg-(--neutral-bg) p-4 sm:p-5">
        <p className="text-xs tracking-[0.04em] text-(--ink-3) uppercase">
          No security verdict
        </p>
        <h3 className="mt-2 text-lg font-medium">{report.title}</h3>
        <p className="mt-2 max-w-[75ch] text-sm text-pretty text-(--ink-2)">
          {report.message}
        </p>
        {retryIn > 0 && (
          <p className="mt-2 text-sm text-(--ink-2)">
            The service asked clients to wait {retryIn} second
            {retryIn === 1 ? '' : 's'} before retrying.
          </p>
        )}
      </div>
      <dl className="grid bg-(--panel-2) sm:grid-cols-2">
        <div className="px-4 py-3 sm:border-r sm:border-(--rule)">
          <dt className="text-xs text-(--ink-3)">Submitted</dt>
          <dd className="mt-1 text-sm break-all">{report.snapshot.source}</dd>
        </div>
        <div className="border-t border-(--rule) px-4 py-3 sm:border-t-0">
          <dt className="text-xs text-(--ink-3)">Kind</dt>
          <dd className="mt-1 text-sm">{report.snapshot.kind}</dd>
        </div>
      </dl>
      {(report.retryable && onRetry) || onChooseSource ? (
        <div className="flex flex-wrap gap-3 border-t border-(--rule) p-4">
          {report.retryable && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retryIn > 0}
              className="min-h-11 border border-(--fill-bg) bg-(--fill-bg) px-4 py-2 text-sm text-(--fill-text) hover:bg-transparent hover:text-(--ink) disabled:cursor-not-allowed disabled:border-(--control-rule) disabled:bg-(--panel-2) disabled:text-(--ink-3)"
            >
              {retryIn > 0
                ? `Retry in ${retryIn}s`
                : 'Retry original submission'}
            </button>
          )}
          {onChooseSource && (
            <button
              type="button"
              onClick={onChooseSource}
              className="min-h-11 border border-(--control-rule) px-4 py-2 text-sm hover:bg-(--panel-2)"
            >
              Choose the package again
            </button>
          )}
        </div>
      ) : null}
    </section>
  )
}

function SecurityView({ report }: { report: NormalizedReport }) {
  const [openUnits, setOpenUnits] = useState<Set<string>>(
    () =>
      new Set(
        report.units
          .filter((unit) => unit.verdict !== 'CLEAN' || unit.incomplete)
          .map((unit) => unit.id)
      )
  )
  const firstWithFinding =
    report.units.find((unit) => unit.findings.length > 0) || null

  const toggleUnit = (unitId: string) => {
    setOpenUnits((current) => {
      const next = new Set(current)
      if (next.has(unitId)) next.delete(unitId)
      else next.add(unitId)
      return next
    })
  }

  const viewFinding = firstWithFinding
    ? () => {
        setOpenUnits((current) => new Set(current).add(firstWithFinding.id))
        requestAnimationFrame(() => {
          document.getElementById(`${firstWithFinding.id}-evidence`)?.focus()
          document
            .getElementById(`${firstWithFinding.id}-evidence`)
            ?.scrollIntoView({ block: 'start' })
        })
      }
    : null

  return (
    <section
      aria-labelledby="report-heading"
      className="border border-(--rule) bg-(--panel)"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--rule) px-4 py-3 sm:px-5">
        <h2
          id="report-heading"
          className="font-serif text-2xl leading-none font-normal"
        >
          Report
        </h2>
        <a
          href="https://bluethroatlabs.com"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-(--ink-2) no-underline transition-colors hover:text-(--ink)"
        >
          BlueSkills · by Bluethroat Labs
        </a>
      </header>
      <SourceRecord report={report} />
      <ResultSummary report={report} onViewFinding={viewFinding} />
      {report.intentionalSkips.length > 0 && (
        <details className="border border-(--rule) bg-(--panel) px-3 py-2.5 text-sm">
          <summary className="min-h-8 text-(--ink-2)">
            Some optional analysis was intentionally skipped
          </summary>
          <ul className="mt-2 space-y-1 pl-5 text-(--ink-2)">
            {report.intentionalSkips.map((skip) => (
              <li key={skip}>{skip}</li>
            ))}
          </ul>
        </details>
      )}
      {report.units.length > 0 ? (
        report.units.map((unit) => (
          <UnitReport
            key={unit.id}
            unit={unit}
            open={openUnits.has(unit.id)}
            onToggle={() => toggleUnit(unit.id)}
          />
        ))
      ) : (
        <p className="border border-(--rule) bg-(--panel) p-4 text-sm text-(--ink-2)">
          The service returned no individually inspectable report units.
        </p>
      )}
    </section>
  )
}

export function ReportView({
  state,
  onRetry,
  onChooseSource,
}: ReportViewProps) {
  if (state.kind === 'operational') {
    return (
      <OperationalView
        report={state}
        onRetry={onRetry}
        onChooseSource={onChooseSource}
      />
    )
  }
  return (
    <SecurityView
      key={`${state.report.scanId || state.report.snapshot.requestId}-${state.report.status}-${String(state.report.raw.updated_at || '')}`}
      report={state.report}
    />
  )
}
