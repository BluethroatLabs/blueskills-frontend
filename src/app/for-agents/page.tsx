import type { Metadata } from 'next'
import Link from 'next/link'
import { ReadingDocumentPage } from '@/components/content-page'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'BlueSkills for AI Agents | Pre-Install Skill Scanning',
  description:
    'Scan a third-party skill with the bluethroat CLI before installing it. Read the exit code, findings, and coverage, then get approval for that revision.',
  path: '/for-agents',
})

export default function ForAgentsPage() {
  return (
    <ReadingDocumentPage
      title="BlueSkills for AI agents"
      lead="Scan the exact revision with the bluethroat CLI before you install it."
      labelledBy="for-agents-title"
    >
      <p>
        Use <code>bluethroat</code> to scan a skill before you install it. The
        website and the Telegram bot are the same checkpoint when a person
        submits the source instead.
      </p>
      <p>
        The website and the Telegram bot accept a public GitHub or GitLab
        repository, a ZIP package, or a <code>SKILL.md</code> file and return a
        BlueSkills report. The report includes the submitted source, the commit
        the git host disclosed when it disclosed one, the verdict, the risk
        score, findings, quoted evidence, analysis coverage, and any limitations
        encountered during the scan.
      </p>
      <p>
        BlueSkills does not make the installation decision for the user. A
        completed scan gives the agent and user evidence to review before
        approving the revision that was scanned.
      </p>

      <section>
        <h2>Command-line client</h2>
        <p>
          <code>bluethroat</code> calls the API, waits for the report, and
          prints it. Install only from a report you just produced for that same
          revision. This website requires a human check. Do not POST scans here.
        </p>
        <p>Python 3.11 or newer.</p>
        <pre>
          <code>uv tool install bluethroat</code>
        </pre>

        <h3>Log in once</h3>
        <pre>
          <code>bluethroat auth login</code>
        </pre>
        <p>
          GitHub device flow. Stderr prints <code>Open &lt;url&gt;</code> and{' '}
          <code>Enter code &lt;code&gt;</code>. The user approves that code in a
          browser. Wait until stdout prints{' '}
          <code>logged in as &lt;login&gt;</code>.
        </p>
        <pre>
          <code>{`bluethroat auth status
bluethroat auth logout`}</code>
        </pre>
        <p>
          <code>status</code> prints{' '}
          <code>logged in as &lt;login&gt; (id &lt;id&gt;)</code>.{' '}
          <code>logout</code> deletes the local session and revokes the token.
          If revoke fails, the local session is already gone: tell the user to
          revoke Bluethroat under GitHub Settings → Applications.
        </p>
        <p>
          The access token lasts 8 hours. The CLI refreshes it. Leave the client
          secret unset. The session is in the OS credential store, or in{' '}
          <code>~/.config/bluethroat/credentials.json</code> (mode 0600) when
          that store is unavailable.
        </p>

        <h3>Scan the exact revision</h3>
        <pre>
          <code>
            bluethroat blueskills scan &lt;source&gt; [--ref REF] [--json]
          </code>
        </pre>
        <ul>
          <li>
            <code>&lt;source&gt;</code> is a public https URL on github.com or
            gitlab.com, a skill directory, a <code>.zip</code> (max 25 MiB), or
            a file named <code>SKILL.md</code> (max 1 MiB).
          </li>
          <li>
            A directory is packed and uploaded. Symlinks are rejected. A{' '}
            <code>SKILL.md</code> scan checks that file only and does not fetch
            scripts it references.
          </li>
          <li>
            <code>--ref</code> is a branch, tag, or commit, and only for a
            repository URL. A 40-character hex ref must match the commit the
            host scanned. A mismatch exits 4 and prints no verdict.
          </li>
          <li>
            <code>--json</code> prints the scan document on stdout. The default
            is a text report. Progress (<code>Scanning…</code>,{' '}
            <code>Waiting for the report…</code>) is on stderr. The command
            waits up to 15 minutes, then exits 7. Run the same scan again.
          </li>
          <li>Do not send secrets or private packages.</li>
        </ul>

        <h3>Exit code</h3>
        <p>
          Trust the exit code. Only 0 is a finished clean scan, and 0 is still
          not permission to install.
        </p>
        <ul>
          <li>
            <code>0</code> clean and complete. Show the user the report. Install
            only that revision, and only after they approve.
          </li>
          <li>
            <code>1</code> suspicious. Do not install.
          </li>
          <li>
            <code>2</code> malicious. Do not install.
          </li>
          <li>
            <code>3</code> incomplete or partial. Do not treat this as clean.
          </li>
          <li>
            <code>4</code> bad source, or <code>--ref</code> did not match. No
            verdict.
          </li>
          <li>
            <code>5</code> rate limited. Stderr says <code>retry after Ns</code>
            . With <code>--json</code>, stdout JSON has <code>error</code> and{' '}
            <code>retry_after</code>.
          </li>
          <li>
            <code>6</code> not logged in, or GitHub auth failed. Run{' '}
            <code>bluethroat auth login</code>.
          </li>
          <li>
            <code>7</code> the service failed, or the scan status is{' '}
            <code>failed</code>. No verdict.
          </li>
        </ul>

        <h3>Read the report</h3>
        <p>
          Text leads with the verdict. Several skills add a headline, then one
          block per skill. Read every block. <code>PARTIAL</code> means a clean
          result is unreachable. <code>INCOMPLETE SCAN</code> means a layer did
          not run.
        </p>
        <pre>
          <code>{`✗ <source> — MALICIOUS (risk 86/100)
  commit: <sha>
  [HIGH] title  (layer)
         file:line — detail
         evidence: ...`}</code>
        </pre>
        <p>
          <code>--json</code> uses these fields. <code>status</code> is{' '}
          <code>done</code> or <code>failed</code>.
        </p>
        <pre>
          <code>{`complete, worst_verdict | verdict, commit, source
reports[]: skill_name, verdict, risk_score, layers_run, findings[]`}</code>
        </pre>

        <h3>Leave these at the defaults</h3>
        <p>
          Environment variables override{' '}
          <code>~/.config/bluethroat/config.json</code>.
        </p>
        <ul>
          <li>
            <code>BLUETHROAT_API_URL</code> (<code>api_url</code>) is the
            BlueSkills API. The default is correct. This website is not the API.
          </li>
          <li>
            <code>BLUETHROAT_GITHUB_CLIENT_ID</code> (
            <code>github_client_id</code>) stays the built-in Bluethroat app id.
          </li>
          <li>
            <code>BLUETHROAT_GITHUB_CLIENT_SECRET</code> (
            <code>github_client_secret</code>) stays unset.
          </li>
          <li>
            <code>BLUETHROAT_CONFIG_DIR</code> overrides the config directory.
            Otherwise it is <code>$XDG_CONFIG_HOME/bluethroat</code> or{' '}
            <code>~/.config/bluethroat</code>.
          </li>
        </ul>
      </section>

      <section>
        <h2>1. Scan the exact source</h2>
        <p>
          Submit the exact public repository revision, ZIP package, or{' '}
          <code>SKILL.md</code> that would be installed through the{' '}
          <Link href="/">BlueSkills web scanner</Link>. Do not execute scripts,
          install dependencies, or activate hooks merely to prepare a package
          for scanning. Do not put secrets in the submission.
        </p>
        <p>
          Scanning only <code>SKILL.md</code> is a one-file check. It does not
          include referenced scripts, manifests, hooks, dependencies, or
          surrounding files unless they are submitted as a repository or ZIP. A
          private repository URL is invalid and is not fetched.
        </p>
      </section>

      <section>
        <h2>2. Read the report</h2>
        <p>
          Read the verdict together with the source, findings, quoted evidence,
          analysis stages, and coverage gaps. For a package with several skills,
          review every reported skill unit. A gap is part of the result, not an
          afterthought.
        </p>
        <p>
          <strong>PARTIAL</strong> means a complete CLEAN result is unreachable.{' '}
          <strong>INVALID</strong> and a failed scan provide a reason but no
          risk score. An incomplete scan names the layer that did not run.
          Unscanned files and remote content that arrives only after
          installation are coverage gaps.
        </p>
        <p>
          The risk score is a prioritization signal. It is not a probability
          that the skill is safe or malicious.
        </p>
      </section>

      <section>
        <h2>3. Apply the pre-install policy</h2>

        <h3>MALICIOUS</h3>
        <p>
          Do not install or execute the skill. Show the user the findings and
          quoted evidence.
        </p>

        <h3>SUSPICIOUS</h3>
        <p>
          Show the user the findings, coverage, requested capabilities, and
          remaining uncertainty. Do not install automatically. Continue only
          after explicit user approval.
        </p>

        <h3>CLEAN</h3>
        <p>
          Explain that this scan found no sufficiently suspicious behavior in
          the material and analysis it covered. Verify that the revision being
          installed matches the scanned revision. Obtain user approval before
          installation.
        </p>

        <h3>Incomplete, invalid, partial, or failed scan</h3>
        <p>
          Do not interpret the result as CLEAN. Retry the scan or ask the user
          to review the package manually.
        </p>
      </section>

      <section>
        <h2>Recommended instruction for agents</h2>
        <blockquote>
          Before installing a third-party skill, identify the exact repository
          revision or package that would be installed. Submit that source to
          BlueSkills without executing the skill. Review the completed verdict,
          findings, quoted evidence, and coverage. Tell the user what BlueSkills
          found and what it could not examine. Ask for explicit approval before
          installing the same revision. Never describe CLEAN as proof of safety.
        </blockquote>
      </section>

      <section>
        <h2>What BlueSkills can and cannot establish</h2>
        <p>
          BlueSkills analyzes the submitted material. When runtime observation
          is enabled, it may also watch one execution in an isolated
          environment. It cannot prove how a skill will behave on every
          operating system, under every user configuration, on every execution
          path, or after the source changes.
        </p>
        <p>
          Runtime findings describe behavior observed during one isolated
          execution. An uneventful runtime does not prove that another
          environment or execution path will behave the same way. Two scans of
          the same skill can disagree when runtime observation runs.
        </p>
      </section>

      <section>
        <h2>Privacy and acceptable use</h2>
        <p>
          Submit only material you are authorized to share. Do not submit
          credentials, secrets, customer code, or private repositories.
        </p>
        <p>
          The anonymous web service allows a 15-request burst, then 12 new scans
          per minute per client address, with 4 scans in flight for the service
          and 250 paid analysis calls per UTC day. A limited request returns
          HTTP 429 with a <code>Retry-After</code> value. Wait for that
          interval; do not create parallel clients to get around the limit.
        </p>
      </section>

      <section>
        <h2>Report a missed detection</h2>
        <p>
          If BlueSkills misses reproducibly malicious behavior or incorrectly
          flags a benign skill, open an issue in the{' '}
          <Link
            href="https://github.com/BluethroatLabs/blueskills-public/issues"
            target="_blank"
            rel="noreferrer"
          >
            public BlueSkills repository
          </Link>
          .
        </p>
        <p>
          Include dummy data, the exact source or package, the scan ID, the
          result received, the expected result, and a negative control when
          possible. Never publish real credentials or private packages.
        </p>
      </section>
    </ReadingDocumentPage>
  )
}
