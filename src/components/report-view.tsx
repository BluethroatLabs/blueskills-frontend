'use client'

import { useMemo, useState } from 'react'
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

function toneClasses(verdict: string) {
  switch (verdictTone(verdict)) {
    case 'clean':
      return 'border-[var(--clean-border)] bg-[var(--clean-bg)] text-[var(--clean-fg)]'
    case 'suspicious':
      return 'border-[var(--suspicious-border)] bg-[var(--suspicious-bg)] text-[var(--suspicious-fg)]'
    case 'malicious':
      return 'border-[var(--malicious-border)] bg-[var(--malicious-bg)] text-[var(--malicious-fg)]'
    default:
      return 'border-[var(--neutral-border)] bg-[var(--neutral-bg)] text-[var(--neutral-fg)]'
  }
}

function severityClasses(severity: string) {
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    return 'border-[var(--malicious-border)] bg-[var(--malicious-bg)] text-[var(--malicious-fg)]'
  }
  if (severity === 'MEDIUM') {
    return 'border-[var(--suspicious-border)] bg-[var(--suspicious-bg)] text-[var(--suspicious-fg)]'
  }
  return 'border-[var(--rule)] bg-[var(--panel-2)] text-[var(--ink-2)]'
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
        <path
          d="M3 3l10 10M13 3L3 13"
          stroke="currentColor"
          strokeWidth="1.8"
        />
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
        <path
          d="M3 8.4l3.1 3.1L13 4.7"
          stroke="currentColor"
          strokeWidth="1.8"
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
    <section className="border-b border-(--rule) bg-(--panel-2)">
      <p className="px-4 pt-3 text-xs font-medium tracking-[0.04em] text-(--ink-3) uppercase sm:px-5">
        Source record
      </p>
      <dl className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([term, description]) => (
          <div
            key={term}
            className="min-w-0 border-t border-(--rule) px-4 py-2.5 sm:px-5"
          >
            <dt className="text-xs text-(--ink-3)">{term}</dt>
            {/* TODO: <dd className="mt-0.5 text-sm font-medium break-words wrap-anywhere"> */}
            <dd className="mt-0.5 text-sm font-medium wrap-anywhere">
              {description}
            </dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-(--rule) px-4 py-2 text-xs text-(--ink-3) sm:px-5">
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
      className="coverage-hatch border-b border-(--neutral-border) bg-(--neutral-bg) px-4 py-4 sm:px-5"
    >
      <h3
        id="coverage-warning-heading"
        className="font-medium text-(--neutral-fg)"
      >
        Coverage is incomplete
      </h3>
      <ul className="mt-2 space-y-1.5 pl-5 text-sm text-pretty text-(--ink-2)">
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
    <section className="border-b border-(--rule)">
      <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs tracking-[0.04em] text-(--ink-3) uppercase">
            {report.snapshot.mode === 'paste'
              ? 'Skill result'
              : 'Package result'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div
              className={cx(
                'inline-flex min-h-10 items-center gap-2 border px-3 py-2 font-semibold',
                toneClasses(report.verdict)
              )}
            >
              <VerdictMark verdict={report.verdict} />
              {report.verdict}
            </div>
            <p className="text-pretty text-(--ink)">
              {nextAction(report.verdict)}
            </p>
          </div>
        </div>
        {onViewFinding && (
          <button
            type="button"
            onClick={onViewFinding}
            className="min-h-11 shrink-0 self-start border border-(--control-rule) px-3 py-2 text-sm underline underline-offset-4 transition-colors hover:bg-(--panel-2) md:self-auto"
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

      <CoverageWarning warnings={report.coverageWarnings} />

      <div className="grid grid-cols-2 border-t border-(--rule) sm:grid-cols-4">
        {countCells.map(([label, value], index) => (
          <div
            key={label}
            className={cx(
              'px-3 py-3 tabular-nums sm:px-4',
              index % 2 === 0 && 'border-r border-(--rule)',
              index > 1 && 'border-t border-(--rule) sm:border-t-0',
              index !== countCells.length - 1 &&
                'sm:border-r sm:border-(--rule)'
            )}
          >
            <p className="text-xs text-(--ink-3)">{label}</p>
            <p className="mt-1 text-xl leading-none">{value}</p>
          </div>
        ))}
      </div>

      {verdictCounts.length > 0 && (
        <p className="border-t border-(--rule) px-4 py-2.5 text-xs text-pretty text-(--ink-3) sm:px-5">
          By returned unit:{' '}
          {verdictCounts
            .map(([verdict, count]) => `${count} ${verdict}`)
            .join(', ')}
          . Loose files are counted separately from named skills.
        </p>
      )}
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
    <article className="border border-(--rule) bg-(--panel)">
      <div className="flex flex-wrap items-center gap-2 border-b border-(--rule) px-3 py-2.5">
        <span
          className={cx(
            'border px-2 py-0.5 text-xs font-semibold',
            severityClasses(finding.severity)
          )}
        >
          {finding.severity}
        </span>
        <h4 className="min-w-55 flex-1 text-sm font-medium text-pretty">
          {finding.title}
        </h4>
        {finding.layer && (
          <span className="border border-(--rule) bg-(--panel-2) px-2 py-0.5 text-xs text-(--ink-2)">
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
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-(--ink-3)">
            {location && (
              <div>
                <dt className="sr-only">Location</dt>
                <dd>{location}</dd>
              </div>
            )}
            {finding.reach && (
              <div>
                <dt className="sr-only">Execution reach</dt>
                <dd>{finding.reach}</dd>
              </div>
            )}
          </dl>
        )}

        {finding.evidence ? (
          <div className="mt-4 border border-(--rule) bg-(--code)">
            <div className="flex items-center justify-between gap-3 border-b border-(--rule) px-3 py-2">
              <span className="text-xs font-medium">Quoted evidence</span>
              <button
                type="button"
                aria-pressed={wrap}
                aria-label={`${wrap ? 'Stop wrapping' : 'Wrap'} evidence lines for ${finding.severity.toLowerCase()} finding ${index + 1}`}
                onClick={() => setWrap((value) => !value)}
                className="min-h-8 border border-(--control-rule) px-2 text-xs transition-colors hover:bg-(--panel)"
              >
                {wrap ? 'Scroll lines' : 'Wrap lines'}
              </button>
            </div>
            <pre
              className={cx(
                'max-w-full overflow-x-auto p-3 text-[13px] leading-5 text-(--ink)',
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
    <details className="border-t border-(--rule)">
      <summary className="flex min-h-11 list-none items-center justify-between gap-3 px-3 py-2 text-sm underline underline-offset-4 sm:px-4">
        <span>Inventory, analysis layers and provenance</span>
        <span className="text-xs text-(--ink-3)">Show</span>
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
    <details className="border-t border-(--rule)">
      <summary className="flex min-h-11 list-none items-center justify-between gap-3 px-3 py-2 text-sm underline underline-offset-4 sm:px-4">
        <span>Secondary AI review</span>
        <span className="text-xs text-(--ink-3)">Show</span>
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

  return (
    <article className="border-b border-(--rule) last:border-b-0">
      <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
          <span
            className={cx(
              'inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-semibold',
              toneClasses(unit.verdict)
            )}
          >
            <VerdictMark verdict={unit.verdict} />
            {unit.verdict}
          </span>
          <span className="font-medium">{unit.name}</span>
          {unit.path && (
            <code className="min-w-0 text-xs break-all text-(--ink-3)">
              {unit.path}
            </code>
          )}
          {unit.isPackage && (
            <span className="border border-(--rule) bg-(--panel-2) px-2 py-0.5 text-xs text-(--ink-2)">
              files outside any skill
            </span>
          )}
          <span className="w-full text-xs text-(--ink-3) sm:w-auto">
            {unit.scored && unit.riskScore !== null ? (
              <span title="A triage score, not a probability of safety.">
                risk {unit.riskScore}/100 ·{' '}
              </span>
            ) : null}
            {unit.findings.length} finding
            {unit.findings.length === 1 ? '' : 's'}
          </span>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${unit.id}-body`}
          aria-label={`${open ? 'Collapse' : 'Expand'} report for ${unit.name}`}
          onClick={onToggle}
          className="min-h-10 shrink-0 self-start border border-(--control-rule) px-3 py-1.5 text-sm underline underline-offset-4 transition-colors hover:bg-(--panel-2) sm:self-auto"
        >
          {open ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {open && (
        <div
          id={`${unit.id}-body`}
          className="border-t border-(--rule) bg-(--bg)"
        >
          <div className="p-3 sm:p-4">
            <p className="font-medium">{nextAction(unit.verdict)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {unit.fileCount !== null && (
                <span className="border border-(--rule) bg-(--panel) px-2 py-1 text-xs">
                  {unit.fileCount} file{unit.fileCount === 1 ? '' : 's'}{' '}
                  inspected
                </span>
              )}
              {severityCounts.map(([severity, count]) => (
                <span
                  key={severity}
                  className={cx(
                    'border px-2 py-1 text-xs',
                    severityClasses(severity)
                  )}
                >
                  {count} {severity.toLowerCase()}
                </span>
              ))}
              {unit.layersRun.map((layer) => (
                <span
                  key={layer}
                  className="border border-(--rule) bg-(--panel) px-2 py-1 text-xs text-(--ink-2)"
                >
                  {layer}
                </span>
              ))}
            </div>

            {(unit.incomplete ||
              unit.missingLayers.length > 0 ||
              unit.unscannedMembers.length > 0 ||
              failedStages.length > 0) && (
              <div className="coverage-hatch mt-4 border border-(--neutral-border) bg-(--neutral-bg) p-3 text-sm">
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
              <details className="mt-4 border border-(--rule) bg-(--panel) px-3 py-2 text-sm">
                <summary className="underline underline-offset-4">
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

            {unit.runtimeObservation && (
              <p className="mt-4 text-sm text-pretty text-(--ink-2)">
                {unit.runtimeObservation}
              </p>
            )}

            <section className="mt-5" aria-labelledby={evidenceHeadingId}>
              <h3
                id={evidenceHeadingId}
                tabIndex={-1}
                className="font-serif text-2xl leading-none font-normal"
              >
                Findings and evidence
              </h3>
              {unit.findings.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {unit.findings.map((finding, index) => (
                    <FindingCard
                      key={`${unit.id}-${finding.ruleId}-${index}`}
                      finding={finding}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-(--ink-2)">
                  No findings were returned for this unit. That describes this
                  scan only, not the skill’s safety.
                </p>
              )}
            </section>
          </div>
          <JudgeReview unit={unit} />
          <TechnicalDetails unit={unit} />
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
  return (
    <section
      aria-labelledby="report-heading"
      className="border border-(--rule-2) bg-(--panel)"
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
        {report.retryAfter && (
          <p className="mt-2 text-sm text-(--ink-2)">
            The service asked clients to wait {report.retryAfter} seconds before
            retrying.
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
              className="min-h-11 border border-(--fill-bg) bg-(--fill-bg) px-4 py-2 text-sm text-(--fill-text) hover:bg-transparent hover:text-(--ink)"
            >
              Retry original submission
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
      className="border border-(--rule-2) bg-(--panel)"
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
          className="text-xs underline decoration-(--rule) underline-offset-4"
        >
          BlueSkills · by Bluethroat Labs
        </a>
      </header>
      <SourceRecord report={report} />
      <ResultSummary report={report} onViewFinding={viewFinding} />
      {report.intentionalSkips.length > 0 && (
        <details className="border-b border-(--rule) px-4 py-2.5 text-sm sm:px-5">
          <summary className="underline underline-offset-4">
            Some optional analysis was intentionally skipped
          </summary>
          <ul className="mt-2 space-y-1 pl-5 text-(--ink-2)">
            {report.intentionalSkips.map((skip) => (
              <li key={skip}>{skip}</li>
            ))}
          </ul>
        </details>
      )}
      <div>
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
          <p className="p-4 text-sm text-(--ink-2)">
            The service returned no individually inspectable report units.
          </p>
        )}
      </div>
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
      key={state.report.scanId || state.report.snapshot.requestId}
      report={state.report}
    />
  )
}
