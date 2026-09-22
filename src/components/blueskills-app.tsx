'use client'

import { useEffect, useRef, useState } from 'react'
import type { SubmissionSnapshot } from '@/lib/blueskills'
import { ReportView } from '@/components/report-view'
import { useBlueSkillsScan } from '@/hooks/use-blueskills-scan'
import { SubmissionForm } from './SubmissionForm'
import { ScanProgress } from './ScanProgress'
import { CoveragePrimer } from './CoveragePrimer'

interface Limits {
  textBytes: number
  fetchedArchiveBytes: number
  uploadBytes: number
  maxSkills: number
}

interface BlueSkillsAppProps {
  limits: Limits
}

type SubmissionDraft = Omit<SubmissionSnapshot, 'requestId'>

export const BlueSkillsApp = ({ limits }: BlueSkillsAppProps) => {
  const scan = useBlueSkillsScan()
  const requestIdRef = useRef(0)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState<string | null>(null)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const activeRequestId = scan.snapshot?.requestId

  useEffect(() => {
    if (activeRequestId === undefined) return
    const frame = requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      resultsRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [activeRequestId])

  const consumeTurnstileToken = () => {
    const token = turnstileToken
    if (!token) return null
    setTurnstileToken(null)
    setTurnstileError(null)
    setTurnstileResetKey((value) => value + 1)
    return token
  }

  const submitDraft = (draft: SubmissionDraft) => {
    const token = consumeTurnstileToken()
    if (!token) return
    requestIdRef.current += 1
    scan.submit({ ...draft, requestId: requestIdRef.current }, token)
  }

  const retryOriginal = () => {
    const token = consumeTurnstileToken()
    if (!token) return
    scan.retry(token)
  }

  return (
    <>
      <SubmissionForm
        limits={limits}
        onSubmitDraft={submitDraft}
        isBusy={scan.isBusy}
        isSubmitting={scan.isSubmitting}
        turnstileToken={turnstileToken}
        turnstileError={turnstileError}
        turnstileResetKey={turnstileResetKey}
        onTurnstileTokenChange={setTurnstileToken}
        onTurnstileErrorChange={setTurnstileError}
      />

      {(scan.progress || scan.reportState) && (
        <div ref={resultsRef} className="scroll-mt-3">
          {scan.progress && <ScanProgress progress={scan.progress} />}
          {scan.reportState && (
            <ReportView
              state={scan.reportState}
              onRetry={turnstileToken ? retryOriginal : undefined}
            />
          )}
        </div>
      )}

      <CoveragePrimer />
    </>
  )
}
