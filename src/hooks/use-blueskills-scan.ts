'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import {
  normalizeReport,
  progressCopy,
  type OperationalReport,
  type ReportState,
  type SubmissionSnapshot,
} from '@/lib/blueskills'
import {
  BlueSkillsApiError,
  hasSecurityReport,
  isTerminalPayload,
  mergeScanPayload,
  payloadScanId,
  payloadStatus,
  pollScan,
  submitScan,
  type ScanEnvelope,
} from '@/lib/blueskills-api'

const MAX_POLL_DURATION_MS = 12 * 60 * 1000

export interface ScanProgressState {
  status: string
  label: string
  snapshot: SubmissionSnapshot
  connectionPaused: boolean
}

interface MutationInput {
  snapshot: SubmissionSnapshot
  turnstileToken: string
}

function pollingInterval(status: string): number {
  switch (status) {
    case 'static':
      return 1500
    case 'judging':
      return 2000
    case 'queued':
    case 'queued_deep':
      return 2500
    case 'deep':
    case 'dynamic':
      return 3000
    default:
      return 2500
  }
}

function asApiError(error: unknown): BlueSkillsApiError {
  if (error instanceof BlueSkillsApiError) return error
  return new BlueSkillsApiError(
    'The scanner stopped responding before the report was ready.',
    { retryable: true }
  )
}

function operationalFromError(
  error: BlueSkillsApiError,
  snapshot: SubmissionSnapshot
): OperationalReport {
  const status = error.statusCode
  const title =
    status === 400 || status === 422
      ? 'Submission was not accepted'
      : status === 403
        ? 'Human check did not pass'
        : status === 413
          ? 'Package is too large'
          : status === 429
            ? 'Scanner is busy'
            : status === 503
              ? 'Scanner is temporarily unavailable'
              : status === null
                ? 'Could not reach the scanner'
                : 'Scan could not finish'

  return {
    kind: 'operational',
    snapshot,
    title,
    message: error.message,
    retryable: error.retryable,
    retryAfter: error.retryAfter,
    statusCode: error.statusCode,
  }
}

function terminalFailure(
  envelope: ScanEnvelope,
  snapshot: SubmissionSnapshot
): OperationalReport {
  const message =
    typeof envelope.payload.error === 'string' && envelope.payload.error.trim()
      ? envelope.payload.error.trim()
      : 'The scan ended before a security report was produced.'
  return {
    kind: 'operational',
    snapshot,
    title: 'Scan did not finish',
    message,
    retryable: true,
    retryAfter: envelope.retryAfter,
    statusCode: envelope.statusCode,
  }
}

export function useBlueSkillsScan() {
  const queryClient = useQueryClient()
  const [snapshot, setSnapshot] = useState<SubmissionSnapshot | null>(null)
  const [submitted, setSubmitted] = useState<ScanEnvelope | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)

  const mutation = useMutation({
    mutationFn: ({ snapshot: nextSnapshot, turnstileToken }: MutationInput) =>
      submitScan(nextSnapshot, turnstileToken),
    onMutate: ({ snapshot: nextSnapshot }) => {
      queryClient.removeQueries({
        queryKey: ['blueskills-scan', nextSnapshot.requestId],
      })
      setSnapshot(nextSnapshot)
      setSubmitted(null)
      setStartedAt(Date.now())
    },
    onSuccess: (envelope) => {
      setSubmitted(envelope)
    },
  })

  const submittedScanId = payloadScanId(submitted?.payload)
  const submittedTerminal = isTerminalPayload(submitted?.payload)
  const shouldPoll = Boolean(
    submitted && submittedScanId && !submittedTerminal && !mutation.isPending
  )

  const pollQuery = useQuery({
    queryKey: ['blueskills-scan', snapshot?.requestId, submittedScanId],
    enabled: shouldPoll,
    queryFn: async ({ signal }) => {
      if (!submittedScanId) {
        throw new BlueSkillsApiError(
          'The scanner accepted the submission without returning a scan reference.',
          { retryable: true }
        )
      }
      if (startedAt !== null && Date.now() - startedAt > MAX_POLL_DURATION_MS) {
        throw new BlueSkillsApiError(
          'The scan is taking longer than expected. Retry the original submission to check it again.',
          { statusCode: 408, retryable: true }
        )
      }
      return pollScan(submittedScanId, signal)
    },
    refetchInterval: (query) => {
      const envelope = query.state.data
      if (envelope && isTerminalPayload(envelope.payload)) return false
      return pollingInterval(
        envelope
          ? payloadStatus(envelope.payload)
          : payloadStatus(submitted?.payload)
      )
    },
    refetchIntervalInBackground: false,
    retry: (failureCount, error) =>
      asApiError(error).retryable && failureCount < 2,
    retryDelay: (failureCount) => Math.min(1000 * 2 ** failureCount, 4000),
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
  })

  const latestEnvelope = useMemo<ScanEnvelope | null>(() => {
    if (!submitted) return null
    if (!pollQuery.data) return submitted
    return {
      ...pollQuery.data,
      payload: mergeScanPayload(submitted.payload, pollQuery.data.payload),
    }
  }, [pollQuery.data, submitted])

  const reportState = useMemo<ReportState | null>(() => {
    if (!snapshot) return null
    if (mutation.error) {
      return operationalFromError(asApiError(mutation.error), snapshot)
    }
    if (pollQuery.error) {
      return operationalFromError(asApiError(pollQuery.error), snapshot)
    }
    if (submitted && !submittedTerminal && !submittedScanId) {
      return operationalFromError(
        new BlueSkillsApiError(
          'The scanner accepted the submission without returning a scan reference.',
          { statusCode: 502, retryable: true }
        ),
        snapshot
      )
    }
    if (!latestEnvelope || !isTerminalPayload(latestEnvelope.payload)) {
      return null
    }
    if (hasSecurityReport(latestEnvelope.payload)) {
      return {
        kind: 'security',
        report: normalizeReport(latestEnvelope.payload, snapshot),
      }
    }
    return terminalFailure(latestEnvelope, snapshot)
  }, [
    latestEnvelope,
    mutation.error,
    pollQuery.error,
    snapshot,
    submitted,
    submittedScanId,
    submittedTerminal,
  ])

  const progress = useMemo<ScanProgressState | null>(() => {
    if (!snapshot || reportState) return null
    if (mutation.isPending) {
      return {
        status: 'submitting',
        label: 'Sending the submitted source to the scanner',
        snapshot,
        connectionPaused: mutation.isPaused,
      }
    }
    if (!latestEnvelope || isTerminalPayload(latestEnvelope.payload))
      return null
    const status = payloadStatus(latestEnvelope.payload)
    return {
      status,
      label: progressCopy(status),
      snapshot,
      connectionPaused: pollQuery.fetchStatus === 'paused',
    }
  }, [
    latestEnvelope,
    mutation.isPaused,
    mutation.isPending,
    pollQuery.fetchStatus,
    reportState,
    snapshot,
  ])

  const submit = useCallback(
    (nextSnapshot: SubmissionSnapshot, turnstileToken: string) => {
      mutation.mutate({ snapshot: nextSnapshot, turnstileToken })
    },
    [mutation]
  )

  const retry = useCallback(
    (turnstileToken: string) => {
      if (!snapshot) return
      mutation.mutate({ snapshot, turnstileToken })
    },
    [mutation, snapshot]
  )

  return {
    submit,
    retry,
    snapshot,
    progress,
    reportState,
    isBusy: mutation.isPending || Boolean(progress),
    isSubmitting: mutation.isPending,
  }
}
