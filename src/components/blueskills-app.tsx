'use client'

import Image from 'next/image'
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { SubmissionMode, SubmissionSnapshot } from '@/lib/blueskills'
import { formatBytes } from '@/lib/blueskills'
import { ReportView } from '@/components/report-view'
import { TurnstileWidget } from '@/components/turnstile-widget'
import { EXAMPLES } from '@/lib/examples'
import { TURNSTILE_SITE_KEY } from '@/lib/blueskills-api'
import {
  type ScanProgressState,
  useBlueSkillsScan,
} from '@/hooks/use-blueskills-scan'
import Link from 'next/link'

type ThemeChoice = 'system' | 'light' | 'dark'

const THEME_EVENT = 'blueskills-theme-change'

function readThemeChoice(): ThemeChoice {
  const saved = window.localStorage.getItem('blueskills-theme')
  return saved === 'light' || saved === 'dark' || saved === 'system'
    ? saved
    : 'system'
}

function subscribeThemeChoice(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(THEME_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(THEME_EVENT, callback)
  }
}

function subscribeSystemTheme(callback: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

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

const TABS: Array<{ id: SubmissionMode; label: string }> = [
  { id: 'paste', label: 'Paste SKILL.md' },
  { id: 'repo', label: 'Repo URL' },
  { id: 'zip', label: 'Upload .zip' },
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function BrandAttribution({
  compact = false,
  showIcon = false,
}: {
  compact?: boolean
  showIcon?: boolean
}) {
  return (
    <a
      href="https://bluethroatlabs.com"
      target="_blank"
      rel="noreferrer"
      className={cx(
        'inline-flex items-center gap-2 text-(--ink-3) underline decoration-(--rule) underline-offset-4 transition-colors hover:text-(--ink)',
        compact ? 'text-xs' : 'text-[13px]'
      )}
    >
      {showIcon && (
        <Image
          src="/assets/bluethroat-bird.svg"
          alt="Bluethroat Labs"
          width={20}
          height={20}
          className={cx('theme-ink h-auto', compact ? 'w-4' : 'w-5')}
        />
      )}
      <span>A public good by</span>
      <Image
        src="/assets/bluethroat-wordmark.svg"
        alt="Bluethroat Labs"
        width={155}
        height={22}
        className={cx('theme-ink h-auto', compact ? 'w-25.5' : 'w-29')}
      />
    </a>
  )
}

function ThemeControl({
  value,
  onChange,
}: {
  value: ThemeChoice
  onChange: (theme: ThemeChoice) => void
}) {
  return (
    <div
      role="group"
      aria-label="Color theme"
      className="grid min-h-11 grid-cols-3 border border-(--rule-2)"
    >
      {(['system', 'light', 'dark'] as const).map((theme, index) => (
        <button
          key={theme}
          type="button"
          aria-pressed={value === theme}
          onClick={() => onChange(theme)}
          className={cx(
            'theme-choice min-w-17 px-2.5 py-1.5 text-sm capitalize transition-colors hover:bg-(--panel-2)',
            index < 2 && 'border-r border-(--rule)',
            value === theme &&
              'bg-(--fill-bg) text-(--fill-text) hover:bg-(--fill-bg)'
          )}
        >
          {theme}
        </button>
      ))}
    </div>
  )
}

function ProductHeader({
  theme,
  onThemeChange,
}: {
  theme: ThemeChoice
  onThemeChange: (theme: ThemeChoice) => void
}) {
  return (
    <header className="relative overflow-hidden border border-(--rule-2) bg-(--panel) p-4 sm:p-5">
      <div
        aria-hidden="true"
        className="theme-grain pointer-events-none absolute inset-0 bg-[url('/assets/paper-base.jpg')] bg-size-[320px]"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4 sm:gap-4.5">
        <div className="min-w-0 flex-[1_1_380px]">
          <Link href={'/'} className="flex items-center gap-3.5">
            <Image
              src="/assets/blueskills-emblem.svg"
              alt=""
              width={40}
              height={40}
              priority
              className="theme-ink shrink-0"
            />
            <h1 className="font-serif text-[31px] leading-none font-normal tracking-[0.005em] text-(--ink) sm:text-[38px]">
              BlueSkills
            </h1>
          </Link>
          <div className="mt-2 sm:mt-2.25 sm:ml-13.5">
            <p className="m-0 text-base text-(--ink)">
              Inspect an agent skill before you install it.
            </p>
            <p className="mt-1 max-w-[52ch] text-sm text-pretty text-(--ink-3)">
              Review its instructions, bundled files and the evidence behind the
              verdict.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-start">
          <ThemeControl value={theme} onChange={onThemeChange} />
          <BrandAttribution compact />
        </div>
      </div>
    </header>
  )
}

function SubmissionForm({
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
}) {
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
      className="border border-(--rule) bg-(--panel)"
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
            className={cx(
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

function ScanProgress({ progress }: { progress: ScanProgressState }) {
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

function CoveragePrimer() {
  return (
    <section className="grid border border-(--rule) bg-(--panel) md:grid-cols-2">
      <div className="p-4 sm:p-5 md:border-r md:border-(--rule)">
        <h2 className="font-serif text-2xl leading-none font-normal">
          What this scan covers
        </h2>
        <ul className="mt-4 space-y-3 pl-5 text-sm text-pretty text-(--ink-2) marker:text-(--ink)">
          <li>
            The unit of trust is the whole package: each SKILL.md, nearby
            scripts and config, plus files no skill folder claims.
          </li>
          <li>
            Pasted instructions are read as a one-file skill. Referenced files
            are not fetched.
          </li>
          <li>
            A report is one check of the submitted files. It does not watch the
            skill after installation.
          </li>
        </ul>
      </div>
      <div className="border-t border-(--rule) p-4 sm:p-5 md:border-t-0">
        <h2 className="font-serif text-2xl leading-none font-normal">
          Limits worth knowing
        </h2>
        <ul className="mt-4 space-y-3 pl-5 text-sm text-pretty text-(--ink-2) marker:text-(--ink)">
          <li>
            Instructions fetched later arrive after the scan. Their addresses
            may be listed, but their contents are not read.
          </li>
          <li>
            A runtime observation is one isolated run, not proof of what happens
            in your environment.
          </li>
          <li>
            Uninspected content has no result. A low triage score cannot clear
            it.
          </li>
        </ul>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="flex flex-col gap-4 border-t border-(--rule) pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <BrandAttribution showIcon />
      <nav
        aria-label="Policies and support"
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {['Privacy', 'Terms', 'Support'].map((label) => (
          <a
            key={label}
            href={`/${label.toLowerCase()}`}
            className="text-(--ink-2) underline decoration-(--rule) underline-offset-4 transition-colors hover:text-(--ink)"
          >
            {label}
          </a>
        ))}
      </nav>
    </footer>
  )
}

export function BlueSkillsShell({ children }: { children: ReactNode }) {
  const themeChoice = useSyncExternalStore<ThemeChoice>(
    subscribeThemeChoice,
    readThemeChoice,
    () => 'system'
  )
  const systemDark = useSyncExternalStore(
    subscribeSystemTheme,
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    () => false
  )

  const resolvedTheme = useMemo(
    () =>
      themeChoice === 'system' ? (systemDark ? 'dark' : 'light') : themeChoice,
    [systemDark, themeChoice]
  )

  const chooseTheme = (theme: ThemeChoice) => {
    window.localStorage.setItem('blueskills-theme', theme)
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return (
    <div
      data-theme={resolvedTheme}
      className="min-h-screen bg-(--bg) text-(--ink)"
    >
      <main className="mx-auto flex w-full max-w-270 flex-col gap-3 px-3 pb-18 sm:gap-4.5 sm:px-5">
        <ProductHeader theme={themeChoice} onThemeChange={chooseTheme} />
        {children}
        <Footer />
      </main>
    </div>
  )
}

export function BlueSkillsApp({ limits }: BlueSkillsAppProps) {
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
    <BlueSkillsShell>
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
    </BlueSkillsShell>
  )
}
