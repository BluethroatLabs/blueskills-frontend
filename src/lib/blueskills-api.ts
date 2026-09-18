import type { SubmissionSnapshot } from '@/lib/blueskills'
import { isRecord, isTerminalStatus } from '@/lib/blueskills'

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || ''
).replace(/\/$/, '')

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || ''

export interface ScanEnvelope {
  payload: Record<string, unknown>
  statusCode: number
  retryAfter: number | null
}

export class BlueSkillsApiError extends Error {
  readonly statusCode: number | null
  readonly retryAfter: number | null
  readonly retryable: boolean

  constructor(
    message: string,
    options: {
      statusCode?: number | null
      retryAfter?: number | null
      retryable?: boolean
    } = {}
  ) {
    super(message)
    this.name = 'BlueSkillsApiError'
    this.statusCode = options.statusCode ?? null
    this.retryAfter = options.retryAfter ?? null
    this.retryable = options.retryable ?? false
  }
}

function retryAfterSeconds(response: Response, body: unknown): number | null {
  const header = response.headers.get('retry-after')
  const headerSeconds = header ? Number(header) : Number.NaN
  if (Number.isFinite(headerSeconds) && headerSeconds > 0) {
    return Math.ceil(headerSeconds)
  }
  if (isRecord(body) && typeof body.retry_after === 'number') {
    return Math.max(1, Math.ceil(body.retry_after))
  }
  return null
}

function validationMessage(body: unknown): string | null {
  if (!isRecord(body) || !Array.isArray(body.detail)) return null
  const messages = body.detail.flatMap((item) => {
    if (!isRecord(item) || typeof item.msg !== 'string') return []
    return [item.msg]
  })
  return messages.length ? messages.join(' ') : null
}

function responseMessage(body: unknown, fallback: string): string {
  if (isRecord(body) && typeof body.error === 'string' && body.error.trim()) {
    return body.error.trim()
  }
  return validationMessage(body) || fallback
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new BlueSkillsApiError(
      'The scanner returned a response that could not be read.',
      { statusCode: response.status, retryable: response.status >= 500 }
    )
  }
}

function apiError(response: Response, body: unknown): BlueSkillsApiError {
  const statusCode = response.status
  const retryAfter = retryAfterSeconds(response, body)
  const fallback =
    statusCode === 400 || statusCode === 422
      ? 'The scanner could not validate this submission.'
      : statusCode === 403
        ? 'The human check did not pass. Complete it again and retry.'
        : statusCode === 413
          ? 'The submitted package is larger than the service limit.'
          : statusCode === 429
            ? 'Too many scans were submitted from this address. Wait and retry.'
            : statusCode === 503
              ? 'The scanner is temporarily unavailable.'
              : 'The scanner could not process this request.'

  return new BlueSkillsApiError(responseMessage(body, fallback), {
    statusCode,
    retryAfter,
    retryable:
      statusCode === 403 ||
      statusCode === 408 ||
      statusCode === 429 ||
      statusCode >= 500,
  })
}

async function requestJson(
  url: string,
  init: RequestInit
): Promise<ScanEnvelope> {
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      cache: 'no-store',
      credentials: 'omit',
      headers: { Accept: 'application/json', ...init.headers },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error
    throw new BlueSkillsApiError(
      'Could not reach the scanner. Check the connection and try again.',
      { retryable: true }
    )
  }

  const body = await readJson(response)
  if (!response.ok) throw apiError(response, body)
  if (!isRecord(body)) {
    throw new BlueSkillsApiError(
      'The scanner returned a response in an unexpected format.',
      { statusCode: response.status, retryable: true }
    )
  }

  return {
    payload: body,
    statusCode: response.status,
    retryAfter: retryAfterSeconds(response, body),
  }
}

export async function submitScan(
  snapshot: SubmissionSnapshot,
  turnstileToken: string
): Promise<ScanEnvelope> {
  const form = new FormData()
  form.set('cf-turnstile-response', turnstileToken)

  if (snapshot.mode === 'paste' && snapshot.text !== undefined) {
    form.set('skill_md', snapshot.text)
  } else if (snapshot.mode === 'repo' && snapshot.url !== undefined) {
    form.set('repo_url', snapshot.url)
  } else if (snapshot.mode === 'zip' && snapshot.file) {
    form.set('file', snapshot.file, snapshot.file.name)
  } else {
    throw new BlueSkillsApiError(
      'The original submission is no longer available. Choose it again.',
      { retryable: false }
    )
  }

  return requestJson(`${API_BASE_URL}/scan.json`, {
    method: 'POST',
    body: form,
  })
}

export async function pollScan(
  scanId: string,
  signal: AbortSignal
): Promise<ScanEnvelope> {
  let response: Response
  try {
    response = await fetch(
      `${API_BASE_URL}/scans/${encodeURIComponent(scanId)}`,
      {
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
        headers: { Accept: 'application/json' },
        signal,
      }
    )
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error
    throw new BlueSkillsApiError(
      'The connection to the scanner was interrupted while waiting for the report.',
      { retryable: true }
    )
  }

  const body = await readJson(response)
  if (response.status === 404) {
    return {
      payload: { scan_id: scanId, status: 'queued', _pending_lookup: true },
      statusCode: 202,
      retryAfter: null,
    }
  }
  if (!response.ok) throw apiError(response, body)
  if (!isRecord(body)) {
    throw new BlueSkillsApiError(
      'The scanner returned a response in an unexpected format.',
      { statusCode: response.status, retryable: true }
    )
  }

  return {
    payload: body,
    statusCode: response.status,
    retryAfter: retryAfterSeconds(response, body),
  }
}

export function payloadStatus(payload: unknown): string {
  if (!isRecord(payload) || typeof payload.status !== 'string') return 'done'
  return payload.status.trim().toLowerCase() || 'done'
}

export function payloadScanId(payload: unknown): string | null {
  if (!isRecord(payload) || typeof payload.scan_id !== 'string') return null
  const scanId = payload.scan_id.trim()
  return /^[0-9a-f]{32}$/.test(scanId) ? scanId : null
}

export function isTerminalPayload(payload: unknown): boolean {
  return isTerminalStatus(payloadStatus(payload))
}

export function mergeScanPayload(
  submitted: Record<string, unknown>,
  polled: Record<string, unknown>
): Record<string, unknown> {
  if (polled._pending_lookup === true) return submitted
  const submittedInput = isRecord(submitted.input) ? submitted.input : {}
  const polledInput = isRecord(polled.input) ? polled.input : {}
  return {
    ...submitted,
    ...polled,
    input: { ...submittedInput, ...polledInput },
  }
}

export function hasSecurityReport(payload: unknown): boolean {
  if (!isRecord(payload)) return false
  if (Array.isArray(payload.reports) && payload.reports.length > 0) return true
  return (
    typeof payload.verdict === 'string' &&
    (Array.isArray(payload.findings) || isRecord(payload.stats))
  )
}
