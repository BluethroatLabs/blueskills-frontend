import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { BlueSkillsShell } from '@/components/blueskills-app'

export const metadata: Metadata = {
  title: 'Bluethroat CLI for agents | BlueSkills',
  description:
    'How an agent uses the Bluethroat CLI to scan a skill before installing it: login, the scan command, exit codes, and what each verdict means.',
  alternates: { canonical: '/for-agents' },
  openGraph: {
    type: 'article',
    url: '/for-agents',
    siteName: 'BlueSkills by Bluethroat Labs',
    title: 'Bluethroat CLI for agents | BlueSkills',
    description:
      'Scan a skill with bluethroat before installing it. Commands, exit codes, and limits.',
  },
}

function Command({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto border border-(--rule) bg-(--code) px-3 py-2.5 text-sm leading-6 text-(--ink)">
      <code>{children}</code>
    </pre>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <code className="border border-(--rule) bg-(--code) px-1 text-[0.875em] text-(--ink)">
      {children}
    </code>
  )
}

export default function ForAgentsPage() {
  return (
    <BlueSkillsShell>
      <article className="border border-(--rule) bg-(--panel) p-4 text-sm leading-7 text-(--ink-2) sm:p-6">
        <h1 className="font-serif text-[31px] leading-none font-normal text-(--ink) sm:text-[38px]">
          Scan a skill with the Bluethroat CLI
        </h1>
        <p className="mt-4 max-w-[72ch] text-base leading-7">
          <Kbd>bluethroat</Kbd> scans an agent skill with BlueSkills and prints
          a report. Run it on the exact revision before you install a
          third-party skill. Do not install from a report you did not just
          produce for that revision.
        </p>
        <p className="mt-3 max-w-[72ch]">
          This site is a separate scanner and requires a human check. Do not
          POST scans here. The CLI calls the API itself.
        </p>

        <h2 className="mt-7 font-serif text-2xl text-(--ink)">Install</h2>
        <p className="mt-3 max-w-[72ch]">Python 3.11 or newer.</p>
        <Command>uv tool install bluethroat</Command>

        <h2 className="mt-7 font-serif text-2xl text-(--ink)">Log in once</h2>
        <Command>bluethroat auth login</Command>
        <p className="mt-3 max-w-[72ch]">
          GitHub device flow. Stderr prints <Kbd>Open &lt;url&gt;</Kbd> and{' '}
          <Kbd>Enter code &lt;code&gt;</Kbd>. The user approves that code in a
          browser. Wait until stdout prints{' '}
          <Kbd>logged in as &lt;login&gt;</Kbd>.
        </p>
        <Command>{`bluethroat auth status\nbluethroat auth logout`}</Command>
        <p className="mt-3 max-w-[72ch]">
          <Kbd>status</Kbd> prints{' '}
          <Kbd>logged in as &lt;login&gt; (id &lt;id&gt;)</Kbd>.{' '}
          <Kbd>logout</Kbd> deletes the local session and revokes the token. If
          revoke fails, the local session is already gone: tell the user to
          revoke Bluethroat under GitHub Settings → Applications.
        </p>
        <p className="mt-3 max-w-[72ch]">
          The access token lasts 8 hours. The CLI refreshes it. Leave the client
          secret unset. The session is in the OS credential store, or in{' '}
          <Kbd>~/.config/bluethroat/credentials.json</Kbd> (mode 0600) when that
          store is unavailable.
        </p>

        <h2 className="mt-7 font-serif text-2xl text-(--ink)">
          Scan the exact revision
        </h2>
        <Command>
          bluethroat blueskills scan &lt;source&gt; [--ref REF] [--json]
        </Command>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <Kbd>&lt;source&gt;</Kbd> is a public https URL on github.com or
            gitlab.com, a skill directory, a <Kbd>.zip</Kbd> (max 25 MiB), or a
            file named <Kbd>SKILL.md</Kbd> (max 1 MiB).
          </li>
          <li>
            A directory is packed and uploaded. Symlinks are rejected. A{' '}
            <Kbd>SKILL.md</Kbd> scan checks that file only and does not fetch
            scripts it references.
          </li>
          <li>
            <Kbd>--ref</Kbd> is a branch, tag, or commit, and only for a
            repository URL. A 40-character hex ref must match the commit the
            host scanned. A mismatch exits 4 and prints no verdict.
          </li>
          <li>
            <Kbd>--json</Kbd> prints the scan document on stdout. The default is
            a text report. Progress (<Kbd>Scanning…</Kbd>,{' '}
            <Kbd>Waiting for the report…</Kbd>) is on stderr. The command waits
            up to 15 minutes, then exits 7. Run the same scan again.
          </li>
          <li>Do not send secrets or private packages.</li>
        </ul>

        <h2 className="mt-7 font-serif text-2xl text-(--ink)">Exit code</h2>
        <p className="mt-3 max-w-[72ch]">
          Trust the exit code. Only 0 is a finished clean scan, and 0 is still
          not permission to install.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <Kbd>0</Kbd> clean and complete. Show the user the report. Install
            only that revision, and only after they approve.
          </li>
          <li>
            <Kbd>1</Kbd> suspicious. Do not install.
          </li>
          <li>
            <Kbd>2</Kbd> malicious. Do not install.
          </li>
          <li>
            <Kbd>3</Kbd> incomplete or partial. Do not treat this as clean.
          </li>
          <li>
            <Kbd>4</Kbd> bad source, or <Kbd>--ref</Kbd> did not match. No
            verdict.
          </li>
          <li>
            <Kbd>5</Kbd> rate limited. Stderr says <Kbd>retry after Ns</Kbd>.
            With <Kbd>--json</Kbd>, stdout JSON has <Kbd>error</Kbd> and{' '}
            <Kbd>retry_after</Kbd>.
          </li>
          <li>
            <Kbd>6</Kbd> not logged in, or GitHub auth failed. Run{' '}
            <Kbd>bluethroat auth login</Kbd>.
          </li>
          <li>
            <Kbd>7</Kbd> the service failed, or the scan status is{' '}
            <Kbd>failed</Kbd>. No verdict.
          </li>
        </ul>

        <h2 className="mt-7 font-serif text-2xl text-(--ink)">
          Read the report
        </h2>
        <p className="mt-3 max-w-[72ch]">
          Text leads with the verdict. Several skills add a headline, then one
          block per skill. Read every block. <Kbd>PARTIAL</Kbd> means a clean
          result is unreachable. <Kbd>INCOMPLETE SCAN</Kbd> means a layer did
          not run.
        </p>
        <Command>
          {`✗ <source> — MALICIOUS (risk 86/100)
  commit: <sha>
  [HIGH] title  (layer)
         file:line — detail
         evidence: ...`}
        </Command>
        <p className="mt-3 max-w-[72ch]">
          <Kbd>--json</Kbd> uses these fields. <Kbd>status</Kbd> is{' '}
          <Kbd>done</Kbd> or <Kbd>failed</Kbd>.
        </p>
        <Command>
          {`complete, worst_verdict | verdict, commit, source
reports[]: skill_name, verdict, risk_score, layers_run, findings[]`}
        </Command>

        <h2 className="mt-7 font-serif text-2xl text-(--ink)">
          Leave these at the defaults
        </h2>
        <p className="mt-3 max-w-[72ch]">
          Environment variables override{' '}
          <Kbd>~/.config/bluethroat/config.json</Kbd>.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <Kbd>BLUETHROAT_API_URL</Kbd> (<Kbd>api_url</Kbd>) is the BlueSkills
            API. The default is correct. This website is not the API.
          </li>
          <li>
            <Kbd>BLUETHROAT_GITHUB_CLIENT_ID</Kbd> (<Kbd>github_client_id</Kbd>)
            stays the built-in Bluethroat app id.
          </li>
          <li>
            <Kbd>BLUETHROAT_GITHUB_CLIENT_SECRET</Kbd> (
            <Kbd>github_client_secret</Kbd>) stays unset.
          </li>
          <li>
            <Kbd>BLUETHROAT_CONFIG_DIR</Kbd> overrides the config directory.
            Otherwise it is <Kbd>$XDG_CONFIG_HOME/bluethroat</Kbd> or{' '}
            <Kbd>~/.config/bluethroat</Kbd>.
          </li>
        </ul>
        <p className="mt-7 max-w-[72ch]">
          A clean result describes this scan of the submitted files. It does not
          watch the skill after installation, and it does not cover a later
          revision.
        </p>
      </article>
    </BlueSkillsShell>
  )
}
