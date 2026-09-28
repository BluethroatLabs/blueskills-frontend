import type { Metadata } from 'next'
import Link from 'next/link'
import { ReadingDocumentPage } from '@/components/content-page'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'BlueSkills for AI Agents | Pre-Install Skill Scanning',
  description:
    'Use BlueSkills as a pre-install checkpoint for third-party AI agent skills, review findings and coverage, and obtain approval before installation.',
  path: '/for-agents',
})

export default function ForAgentsPage() {
  return (
    <ReadingDocumentPage
      title="BlueSkills for AI agents"
      lead="Scan a third-party skill before you install it."
      labelledBy="for-agents-title"
    >
      <p>
        BlueSkills is a checkpoint an agent can ask a person to use before
        installing a third-party skill.
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
          The <code>bluethroat</code> CLI is specified as a separate project but
          is not released. Commands, authentication behavior, and CLI output
          documentation will be published after that implementation matches the
          reviewed contract.
        </p>
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
