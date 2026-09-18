export type SubmissionMode = 'paste' | 'repo' | 'zip'

export interface SubmissionSnapshot {
  requestId: number
  mode: SubmissionMode
  source: string
  kind: string
  text?: string
  url?: string
  file?: File
}

export interface ApiFinding {
  ruleId: string | null
  layer: string | null
  severity: string
  title: string
  detail: string | null
  file: string | null
  line: number | null
  evidence: string | null
  reach: string | null
}

export interface StageRecord {
  name: string
  status: string
  error: string | null
}

export interface InventoryRecord {
  path: string
  sha256: string | null
  analyzed: boolean | null
  skipReason: string | null
}

export interface JudgeRecord {
  verdict: string | null
  proposedVerdict: string | null
  enforcedVerdict: string | null
  confidence: string | number | null
  reasoning: string | null
  action: string | null
  overrideReason: string | null
  model: string | null
  truncated: boolean
}

export interface ScanUnit {
  id: string
  name: string
  path: string | null
  isPackage: boolean
  verdict: string
  scored: boolean
  riskScore: number | null
  findings: ApiFinding[]
  layersRun: string[]
  stages: StageRecord[]
  incomplete: boolean
  missingLayers: string[]
  unscannedMembers: string[]
  loadWarnings: string[]
  layerErrors: string[]
  fileCount: number | null
  referencedCount: number | null
  remoteIngress: string[]
  installEntrypoints: Array<{ path: string; reason: string }>
  inventory: InventoryRecord[]
  judge: JudgeRecord | null
  runtimeObservation: string | null
  provenance: string | null
  analyzedAt: string | null
  analyzerVersion: string | null
  rulesetVersion: string | null
}

export interface NormalizedReport {
  raw: Record<string, unknown>
  snapshot: SubmissionSnapshot
  status: string
  scanId: string | null
  verdict: string
  complete: boolean | null
  units: ScanUnit[]
  source: {
    scope: string | null
    commit: string | null
    serviceSource: string | null
  }
  counts: {
    skillsFound: number | null
    skillsScanned: number
    looseFileUnits: number
    looseFiles: number | null
    notScanned: number | null
  }
  stages: StageRecord[]
  coverageWarnings: string[]
  intentionalSkips: string[]
}

export interface OperationalReport {
  kind: 'operational'
  snapshot: SubmissionSnapshot
  title: string
  message: string
  retryable: boolean
  retryAfter: number | null
  statusCode: number | null
}

export interface SecurityReport {
  kind: 'security'
  report: NormalizedReport
}

export type ReportState = OperationalReport | SecurityReport

type JsonRecord = Record<string, unknown>

const VERDICT_ORDER: Record<string, number> = {
  MALICIOUS: 6,
  PARTIAL: 5,
  SUSPICIOUS: 4,
  INVALID: 3,
  ERROR: 2,
  CLEAN: 1,
}

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function record(value: unknown): JsonRecord {
  return isRecord(value) ? value : {}
}

function stringValue(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function titleCase(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function normalizeVerdict(value: unknown): string {
  const verdict = stringValue(value)?.toUpperCase()
  return verdict || 'NO REPORT'
}

export function verdictTone(
  verdict: string
): 'clean' | 'suspicious' | 'malicious' | 'neutral' {
  if (verdict === 'CLEAN') return 'clean'
  if (verdict === 'SUSPICIOUS') return 'suspicious'
  if (verdict === 'MALICIOUS') return 'malicious'
  return 'neutral'
}

export function isTerminalStatus(status: string): boolean {
  return status === 'done' || status === 'failed'
}

export function progressCopy(status: string): string {
  switch (status) {
    case 'static':
      return 'Reviewing the submitted files'
    case 'queued':
    case 'queued_deep':
      return 'Waiting for deeper analysis'
    case 'deep':
      return 'Analyzing the package'
    case 'dynamic':
      return 'Observing behavior in an isolated test'
    case 'judging':
      return 'Reviewing findings'
    default:
      return 'Running the initial scan'
  }
}

function normalizeFinding(value: unknown): ApiFinding | null {
  if (!isRecord(value)) return null
  return {
    ruleId: stringValue(value.rule_id),
    layer: stringValue(value.layer),
    severity: stringValue(value.severity)?.toUpperCase() || 'INFO',
    title:
      stringValue(value.title) ||
      stringValue(value.message) ||
      'Finding returned without a title',
    detail: stringValue(value.detail),
    file: stringValue(value.file),
    line: numberValue(value.line),
    evidence: stringValue(value.evidence),
    reach:
      stringValue(value.reach) || stringValue(record(value.metadata).reach),
  }
}

function normalizeStages(value: unknown): StageRecord[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    const name = stringValue(item.name)
    const status = stringValue(item.status)
    if (!name || !status) return []
    return [{ name, status, error: stringValue(item.error) }]
  })
}

function normalizeInventory(value: unknown): InventoryRecord[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    const path = stringValue(item.path)
    if (!path) return []
    return [
      {
        path,
        sha256: stringValue(item.sha256),
        analyzed: booleanValue(item.analyzed),
        skipReason: stringValue(item.skip_reason),
      },
    ]
  })
}

function normalizeJudge(
  value: unknown,
  enforcedVerdict: string
): JudgeRecord | null {
  if (!isRecord(value) || Object.keys(value).length === 0) return null
  const proposed =
    stringValue(value.proposed_verdict) || stringValue(value.verdict)
  return {
    verdict: stringValue(value.verdict),
    proposedVerdict: proposed?.toUpperCase() || null,
    enforcedVerdict,
    confidence:
      typeof value.confidence === 'number' ||
      typeof value.confidence === 'string'
        ? value.confidence
        : null,
    reasoning: stringValue(value.reasoning),
    action: stringValue(value.action),
    overrideReason: stringValue(value.override_reason),
    model: stringValue(value.model),
    truncated: value.truncated === true,
  }
}

function normalizeUnit(value: unknown, index: number): ScanUnit | null {
  if (!isRecord(value)) return null
  const stats = record(value.stats)
  const rawName =
    stringValue(value.skill) ||
    stringValue(value.skill_name) ||
    stringValue(value.skill_path)
  const isPackage =
    value.package === true ||
    value.is_package === true ||
    rawName?.toLowerCase() === '(files outside any skill)'
  const verdict = normalizeVerdict(value.verdict)
  const unscored = verdict === 'INVALID' || verdict === 'ERROR'
  const scored = value.scored !== false && !unscored
  let fileCount = numberValue(stats.file_count)
  if (fileCount !== null && !isPackage) fileCount += 1

  const installEntrypoints = Object.entries(
    record(stats.install_entrypoints)
  ).map(([path, reason]) => ({ path, reason: String(reason) }))

  const name = isPackage
    ? 'Files outside any skill'
    : rawName || `Untitled skill ${index + 1}`
  const path = stringValue(value.skill_path) || stringValue(value.skill)
  const findings = Array.isArray(value.findings)
    ? value.findings
        .map(normalizeFinding)
        .filter((item): item is ApiFinding => item !== null)
    : []
  const stages = normalizeStages(stats.stages)

  return {
    id: `unit-${index}-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    name,
    path: isPackage ? null : path,
    isPackage,
    verdict,
    scored,
    riskScore: scored ? numberValue(value.risk_score) : null,
    findings,
    layersRun: stringList(value.layers_run),
    stages,
    incomplete: stats.incomplete === true,
    missingLayers: stringList(stats.missing_layers),
    unscannedMembers: stringList(stats.unscanned_members),
    loadWarnings: stringList(stats.load_warnings),
    layerErrors: stringList(stats.errors),
    fileCount,
    referencedCount: numberValue(stats.referenced_count),
    remoteIngress: stringList(stats.remote_ingress),
    installEntrypoints,
    inventory: normalizeInventory(stats.inventory),
    judge: normalizeJudge(stats.judge, verdict),
    runtimeObservation: stringValue(stats.runtime_observation),
    provenance: stringValue(stats.provenance),
    analyzedAt: stringValue(stats.analyzed_at),
    analyzerVersion: stringValue(stats.analyzer_version),
    rulesetVersion: stringValue(stats.ruleset_version),
  }
}

function worstVerdict(units: ScanUnit[]): string {
  return units.reduce(
    (worst, unit) =>
      (VERDICT_ORDER[unit.verdict] || 0) > (VERDICT_ORDER[worst] || 0)
        ? unit.verdict
        : worst,
    'NO REPORT'
  )
}

function skipDescription(stage: StageRecord): string {
  return `${titleCase(stage.name)} was ${stage.status.replaceAll('_', ' ')}${
    stage.error ? `: ${stage.error}` : '.'
  }`
}

export function normalizeReport(
  payload: unknown,
  snapshot: SubmissionSnapshot
): NormalizedReport {
  const raw = record(payload)
  const rawReports = Array.isArray(raw.reports) ? raw.reports : []
  const normalizedUnits = (rawReports.length ? rawReports : [raw])
    .map(normalizeUnit)
    .filter((item): item is ScanUnit => item !== null)
    .sort((a, b) => {
      const aNeedsAction = a.verdict !== 'CLEAN' || a.incomplete
      const bNeedsAction = b.verdict !== 'CLEAN' || b.incomplete
      if (aNeedsAction !== bNeedsAction) return aNeedsAction ? -1 : 1
      return (VERDICT_ORDER[b.verdict] || 0) - (VERDICT_ORDER[a.verdict] || 0)
    })

  const input = record(raw.input)
  const status = stringValue(raw.status) || 'done'
  const stages = normalizeStages(raw.stages)
  const explicitVerdict =
    stringValue(raw.worst_verdict) || stringValue(raw.verdict)
  const verdict = explicitVerdict
    ? normalizeVerdict(explicitVerdict)
    : worstVerdict(normalizedUnits)
  const namedUnits = normalizedUnits.filter((unit) => !unit.isPackage)
  const packageUnits = normalizedUnits.filter((unit) => unit.isPackage)
  const totalFound = numberValue(raw.total_found)
  const scanned = numberValue(raw.scanned) ?? namedUnits.length
  const deadlineSkipped = numberValue(raw.deadline_skipped) ?? 0
  const inferredNotScanned =
    totalFound !== null ? Math.max(0, totalFound - scanned) : null
  const notScanned =
    deadlineSkipped > 0
      ? Math.max(deadlineSkipped, inferredNotScanned || 0)
      : inferredNotScanned

  const coverageWarnings: string[] = []
  if (raw.truncated === true) {
    coverageWarnings.push(
      totalFound !== null
        ? `Only ${scanned} of ${totalFound} returned skills were scanned. Narrow the submission to cover the rest.`
        : 'The service truncated this submission. Some returned skills were not scanned.'
    )
  }
  if (deadlineSkipped > 0) {
    coverageWarnings.push(
      `${deadlineSkipped} skill${deadlineSkipped === 1 ? ' was' : 's were'} not scanned before the request deadline.`
    )
  }

  const skippedCounters: Array<[string, number]> = [
    ['advisory lookups', numberValue(raw.osv_skipped) ?? 0],
    ['guard analysis', numberValue(raw.guard_skipped) ?? 0],
    ['similarity analysis', numberValue(raw.embed_skipped) ?? 0],
    ['AI review', numberValue(raw.judge_skipped) ?? 0],
  ]
  for (const [label, count] of skippedCounters) {
    if (count > 0) {
      coverageWarnings.push(
        `${label} did not run for ${count} skill${count === 1 ? '' : 's'} because the analysis allowance was reached.`
      )
    }
  }
  if (raw.paid_exhausted === true) {
    coverageWarnings.push(
      'The service allowance for billed analysis layers was exhausted. Deterministic findings remain, but coverage is narrower.'
    )
  }
  if (status === 'failed') {
    coverageWarnings.push(
      stringValue(raw.error)
        ? `A required stage failed: ${stringValue(raw.error)}`
        : 'A required stage failed. Findings already returned remain valid, but coverage is incomplete.'
    )
  }
  for (const stage of stages) {
    if (stage.status === 'failed') coverageWarnings.push(skipDescription(stage))
  }
  for (const unit of normalizedUnits) {
    if (unit.incomplete) {
      coverageWarnings.push(`${unit.name} has incomplete analysis coverage.`)
    }
    if (unit.unscannedMembers.length) {
      coverageWarnings.push(
        `${unit.name} has ${unit.unscannedMembers.length} unscanned member${unit.unscannedMembers.length === 1 ? '' : 's'}: ${unit.unscannedMembers.join(', ')}.`
      )
    }
    for (const stage of unit.stages) {
      if (stage.status === 'failed' || stage.status === 'skipped_budget') {
        coverageWarnings.push(`${unit.name}: ${skipDescription(stage)}`)
      }
    }
  }

  const intentionalSkips = [
    ...stages
      .filter(
        (stage) =>
          stage.status.startsWith('skipped_') &&
          stage.status !== 'skipped_budget'
      )
      .map(skipDescription),
    ...normalizedUnits.flatMap((unit) =>
      unit.stages
        .filter(
          (stage) =>
            stage.status.startsWith('skipped_') &&
            stage.status !== 'skipped_budget'
        )
        .map((stage) => `${unit.name}: ${skipDescription(stage)}`)
    ),
  ]

  return {
    raw,
    snapshot,
    status,
    scanId: stringValue(raw.scan_id),
    verdict,
    complete: booleanValue(raw.complete),
    units: normalizedUnits,
    source: {
      scope: stringValue(raw.scope) || stringValue(input.scope),
      commit: stringValue(raw.commit) || stringValue(input.commit),
      serviceSource: stringValue(raw.slug) || stringValue(input.source),
    },
    counts: {
      skillsFound: totalFound ?? (snapshot.mode === 'paste' ? 1 : null),
      skillsScanned: scanned,
      looseFileUnits: packageUnits.length,
      looseFiles: numberValue(raw.package_files),
      notScanned,
    },
    stages,
    coverageWarnings: [...new Set(coverageWarnings)],
    intentionalSkips: [...new Set(intentionalSkips)],
  }
}

export function formatBytes(bytes: number): string {
  if (bytes % (1024 * 1024) === 0) return `${bytes / (1024 * 1024)} MiB`
  if (bytes % 1024 === 0) return `${bytes / 1024} KiB`
  return `${bytes.toLocaleString()} bytes`
}
