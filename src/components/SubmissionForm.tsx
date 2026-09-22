'use client'

import { FormEvent, KeyboardEvent, useId, useRef, useState } from 'react'
import type { SubmissionMode, SubmissionSnapshot } from '@/lib/blueskills'
import { formatBytes } from '@/lib/blueskills'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { EXAMPLES } from '@/lib/examples'
import { TURNSTILE_SITE_KEY } from '@/lib/blueskills-api'
import { cn } from 'cn'

interface Limits {
  textBytes: number
  fetchedArchiveBytes: number
  uploadBytes: number
  maxSkills: number
}

type SubmissionDraft = Omit<SubmissionSnapshot, 'requestId'>

const TABS: Array<{ id: SubmissionMode; label: string }> = [
  { id: 'paste', label: 'Paste SKILL.md' },
  { id: 'repo', label: 'Repo URL' },
  { id: 'zip', label: 'Upload .zip' },
]

export const SubmissionForm = ({
  limits,
  onSubmitDraft,
  isBusy,
  isSubmitting,
  turnstileToken,
  turnstileError,
  turnstileResetKey,
  onTurnstileTokenChange,
  onTurnstileErrorChange,
}: {
  limits: Limits
  onSubmitDraft: (draft: SubmissionDraft) => void
  isBusy: boolean
  isSubmitting: boolean
  turnstileToken: string | null
  turnstileError: string | null
  turnstileResetKey: number
  onTurnstileTokenChange: (token: string | null) => void
  onTurnstileErrorChange: (message: string | null) => void
}) => {
  const [activeTab, setActiveTab] = useState<SubmissionMode>('paste')
  const [paste, setPaste] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const pasteRef = useRef<HTMLTextAreaElement>(null)
  const repoRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const tabPanelId = useId()

  const selectTab = (mode: SubmissionMode, focus = false) => {
    const index = TABS.findIndex((tab) => tab.id === mode)
    setActiveTab(mode)
    setError(null)
    if (focus) requestAnimationFrame(() => tabRefs.current[index]?.focus())
  }

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % TABS.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + TABS.length) % TABS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = TABS.length - 1
    }
    if (nextIndex === null) return
    event.preventDefault()
    selectTab(TABS[nextIndex].id, true)
  }

  const fillExample = (value: string) => {
    setPaste(value)
    setError(null)
    requestAnimationFrame(() => pasteRef.current?.focus())
  }

  const fail = (message: string, target: 'paste' | 'repo' | 'zip') => {
    setError(message)
    requestAnimationFrame(() => {
      if (target === 'paste') pasteRef.current?.focus()
      if (target === 'repo') repoRef.current?.focus()
      if (target === 'zip') fileRef.current?.focus()
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (activeTab === 'paste') {
      if (!paste.trim())
        return fail('Paste a SKILL.md before scanning.', 'paste')
      if (new TextEncoder().encode(paste).length > limits.textBytes) {
        return fail(
          `That text is larger than the ${formatBytes(limits.textBytes)} limit.`,
          'paste'
        )
      }
      onSubmitDraft({
        mode: 'paste',
        source: 'Pasted SKILL.md',
        kind: 'Pasted instructions',
        text: paste,
      })
      return
    }

    if (activeTab === 'repo') {
      if (!repoUrl.trim()) return fail('Enter a public repository URL.', 'repo')
      try {
        const url = new URL(repoUrl)
        if (
          url.protocol !== 'https:' ||
          !['github.com', 'gitlab.com'].includes(url.hostname.toLowerCase())
        ) {
          return fail(
            'Use a public HTTPS URL from github.com or gitlab.com.',
            'repo'
          )
        }
      } catch {
        return fail('Enter a complete public repository URL.', 'repo')
      }
      onSubmitDraft({
        mode: 'repo',
        source: repoUrl.trim(),
        kind: 'Public repository URL',
        url: repoUrl.trim(),
      })
      return
    }

    if (!file) return fail('Choose a ZIP package before scanning.', 'zip')
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return fail('Choose a file whose name ends in .zip.', 'zip')
    }
    if (file.size > limits.uploadBytes) {
      return fail(
        `That package is larger than the ${formatBytes(limits.uploadBytes)} limit.`,
        'zip'
      )
    }
    onSubmitDraft({ mode: 'zip', source: file.name, kind: 'ZIP package', file })
  }

  const actionLabel = isSubmitting
    ? 'Submitting…'
    : isBusy
      ? 'Scan in progress'
      : !turnstileToken
        ? 'Complete human check'
        : activeTab === 'paste'
          ? 'Scan pasted skill'
          : activeTab === 'repo'
            ? 'Fetch & scan repository'
            : 'Upload & scan package'

  return (
    <section
      aria-labelledby="submission-heading"
      className="border-y border-(--rule) bg-(--panel)"
    >
      <h2
        id="submission-heading"
        className="m-0 border-b border-(--rule) px-4 py-3.5 font-serif text-2xl leading-none font-normal sm:px-5"
      >
        Submit a skill
      </h2>

      <div
        role="tablist"
        aria-label="Submission type"
        className="grid grid-cols-3 border-b border-(--rule-2)"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tabPanelId}-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={cn(
              'submission-tab min-h-12 px-2 py-2.5 text-sm text-pretty transition-colors hover:bg-(--panel-2) sm:text-base',
              index < TABS.length - 1 && 'border-r border-(--rule)',
              activeTab === tab.id &&
                'bg-(--fill-bg) text-(--fill-text) hover:bg-(--fill-bg)'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-3.5 sm:p-5" noValidate>
        <div
          id={`${tabPanelId}-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'paste' && (
            <div>
              <label
                htmlFor="skill-md"
                className="mb-2 block text-sm font-medium"
              >
                SKILL.md contents
              </label>
              <textarea
                ref={pasteRef}
                id="skill-md"
                value={paste}
                onChange={(event) => {
                  setPaste(event.target.value)
                  setError(null)
                }}
                rows={6}
                spellCheck={false}
                aria-describedby="paste-help"
                className="min-h-37 w-full resize-y rounded-none border border-(--control-rule) bg-(--bg) px-3 py-2.5 text-[15px] text-(--ink) caret-(--ink) placeholder:text-(--ink-3)"
                placeholder={'---\nname: example-skill\ndescription: ...\n---'}
              />
              <p id="paste-help" className="mt-2 text-sm text-(--ink-3)">
                Paste one complete, named SKILL.md. Limit:{' '}
                {formatBytes(limits.textBytes)}.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-(--rule) pt-3 text-sm">
                <span className="col-span-3 text-(--ink-3)">
                  Fill an example into the paste field:
                </span>
                <button
                  type="button"
                  onClick={() => fillExample(EXAMPLES.override)}
                  className="min-h-11 border border-(--control-rule) px-2 py-1.5 text-left text-pretty transition-colors hover:bg-(--panel-2)"
                >
                  Instruction override
                </button>
                <button
                  type="button"
                  onClick={() => fillExample(EXAMPLES.exfiltration)}
                  className="min-h-11 border border-(--control-rule) px-2 py-1.5 text-left text-pretty transition-colors hover:bg-(--panel-2)"
                >
                  Silent exfiltration
                </button>
                <button
                  type="button"
                  onClick={() => fillExample(EXAMPLES.benign)}
                  className="min-h-11 border border-(--control-rule) px-2 py-1.5 text-left text-pretty transition-colors hover:bg-(--panel-2)"
                >
                  Benign control
                </button>
              </div>
            </div>
          )}

          {activeTab === 'repo' && (
            <div>
              <label
                htmlFor="repo-url"
                className="mb-2 block text-sm font-medium"
              >
                Public repository, folder or SKILL.md URL
              </label>
              <input
                ref={repoRef}
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={(event) => {
                  setRepoUrl(event.target.value)
                  setError(null)
                }}
                inputMode="url"
                autoComplete="url"
                aria-describedby="repo-help"
                placeholder="https://github.com/owner/repo/tree/main/skills/example"
                className="min-h-12 w-full rounded-none border border-(--control-rule) bg-(--bg) px-3 py-2 text-[15px] text-(--ink) caret-(--ink) placeholder:text-(--ink-3)"
              />
              <p
                id="repo-help"
                className="mt-2 text-sm text-pretty text-(--ink-3)"
              >
                Public HTTPS GitHub or GitLab links only. The service preserves
                folder scope and fetches up to{' '}
                {formatBytes(limits.fetchedArchiveBytes)}; at most{' '}
                {limits.maxSkills} skills are admitted per request.
              </p>
            </div>
          )}

          {activeTab === 'zip' && (
            <div>
              <span className="mb-2 block text-sm font-medium">
                ZIP package
              </span>
              <label className="relative flex min-h-12 items-center border border-(--control-rule) bg-(--bg)">
                <span className="self-stretch border-r border-(--control-rule) bg-(--panel-2) px-3 py-3 text-sm">
                  Choose file
                </span>
                <span className="min-w-0 flex-1 overflow-hidden px-3 py-2 text-sm text-ellipsis whitespace-nowrap text-(--ink-3)">
                  {file?.name || 'No package chosen'}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".zip,application/zip"
                  aria-describedby="zip-help"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] || null)
                    setError(null)
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
              <p
                id="zip-help"
                className="mt-2 text-sm text-pretty text-(--ink-3)"
              >
                Bundled scripts, hooks and config are inspected alongside each
                SKILL.md. Limit: {formatBytes(limits.uploadBytes)}; at most{' '}
                {limits.maxSkills} skills are admitted per request.
              </p>
            </div>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="coverage-hatch mt-4 border border-(--neutral-border) bg-(--neutral-bg) px-3 py-2.5 text-sm text-(--neutral-fg)"
          >
            {error}
          </p>
        )}

        <section
          aria-labelledby="human-check-heading"
          className="mt-4 border-t border-(--rule) pt-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-[52ch]">
              <h3 id="human-check-heading" className="text-sm font-medium">
                Human verification
              </h3>
              <p
                className="mt-1 text-xs leading-5 text-(--ink-3)"
                aria-live="polite"
              >
                {turnstileError ||
                  (turnstileToken
                    ? 'Human check complete. The next submission is ready.'
                    : 'Complete the check before submitting a scan.')}
              </p>
            </div>
            <div className="w-full min-w-0 sm:max-w-75">
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                resetKey={turnstileResetKey}
                onTokenChange={onTurnstileTokenChange}
                onErrorChange={onTurnstileErrorChange}
              />
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col items-stretch justify-between gap-3 border-t border-(--rule) pt-4 sm:flex-row sm:items-center">
          <p className="m-0 max-w-[66ch] text-xs leading-5 text-(--ink-3) sm:text-sm">
            Submit public skill content only. Do not include secrets or private
            package contents.
          </p>
          <button
            type="submit"
            disabled={isBusy || !turnstileToken}
            className="min-h-12 shrink-0 border border-(--fill-bg) bg-(--fill-bg) px-4 py-2.5 text-sm font-medium text-(--fill-text) transition-colors hover:bg-transparent hover:text-(--ink) disabled:cursor-not-allowed disabled:border-(--control-rule) disabled:bg-(--panel-2) disabled:text-(--ink-3)"
          >
            {actionLabel}
          </button>
        </div>
      </form>
    </section>
  )
}
