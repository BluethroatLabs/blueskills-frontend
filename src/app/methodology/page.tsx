import type { Metadata } from 'next'
import Link from 'next/link'
import { ReadingDocumentPage } from '@/components/content-page'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'BlueSkills Methodology, Evidence and Limitations',
  description:
    'See what BlueSkills examines, how verdicts and coverage are reported, what public testing has found, and where the scanner’s limitations remain.',
  path: '/methodology',
})

export default function MethodologyPage() {
  return (
    <ReadingDocumentPage
      title="How BlueSkills analyzes an AI agent skill"
      lead="What evidence should you review before allowing an AI agent to install a skill?"
      labelledBy="methodology-title"
    >
      <p>
        BlueSkills helps a user answer one specific question: what evidence
        should I review before allowing an AI agent to install this skill?
      </p>
      <p>
        It examines the submitted material, identifies suspicious instructions
        or capabilities, and returns the evidence behind its result. BlueSkills
        does not certify that a skill is safe.
      </p>

      <section>
        <h2>What BlueSkills accepts</h2>

        <h3>Pasted SKILL.md</h3>
        <p>
          A pasted <code>SKILL.md</code> is treated as a single-file submission,
          up to 1 MiB. Referenced scripts, hooks, manifests, remote content, and
          surrounding files are not included unless they are separately
          submitted.
        </p>

        <h3>Public GitHub or GitLab repository</h3>
        <p>
          BlueSkills retrieves the submitted public repository. The report
          records the commit the host names on the downloaded archive when the
          host names one. When a repository contains several skills, each skill
          is examined separately, up to five units on a hosted scan. Files
          outside those skill directories are also considered as package
          material. Further units are reported as unscanned, and an unscanned
          unit is not a clean result.
        </p>
        <p>Private repositories are not fetched.</p>

        <h3>ZIP package</h3>
        <p>
          BlueSkills accepts an archive up to 25 MiB and extracts it within a
          256 MiB unpacked limit, 10,000 files, and a per-file text cap of 4
          MiB. A file over that text cap is truncated and the report says so.
        </p>
        <p>
          An archive that contains a symlink, a special file, a duplicate or
          case-colliding member, or an encrypted archive is rejected. That
          rejection is an invalid submission, not a clean scan. Missing git
          submodules, oversized members, and truncated coverage are reported as
          gaps. A gap is not clean content.
        </p>
      </section>

      <section>
        <h2>How the analysis works</h2>
        <p>
          BlueSkills combines complementary forms of analysis. The report lists
          the stages that ran.
        </p>
        <p>
          These stages run on every hosted scan. If one of them fails, the scan
          cannot be a complete CLEAN result:
        </p>
        <ul>
          <li>
            package and scope inspection, including files outside declared skill
            directories
          </li>
          <li>text normalization and obfuscation handling</li>
          <li>instruction and configuration analysis</li>
          <li>
            bundled code and manifest analysis for the languages and manifests
            the scanner supports
          </li>
          <li>dependency and install-time checks</li>
        </ul>
        <p>
          These stages are enabled on the hosted worker and are conditional:
        </p>
        <ul>
          <li>
            advisory lookup for declared dependencies, when the lookup succeeds
          </li>
          <li>
            an additional signature and data-flow pass shipped with the worker
          </li>
          <li>
            model-assisted review of instructions and of similarity to
            known-malicious snippets
          </li>
          <li>
            a final model review, only while the result is still SUSPICIOUS and
            the scan has no critical finding; that review can raise SUSPICIOUS
            to MALICIOUS and cannot clear a finding
          </li>
          <li>
            isolated runtime observation, only when the deployment has that
            stage turned on, and skipped when the earlier result is already
            MALICIOUS
          </li>
        </ul>
        <p>
          The worker image leaves isolated runtime observation off unless the
          running job turns it on. When the stage is on and it fails, times out,
          or has no capacity, CLEAN is not a possible complete result.
        </p>
        <p>
          An embedding pass that was rate-limited or unavailable also cannot be
          a complete CLEAN result. A failed optional lookup that is only
          recorded as a note does not, by itself, change a CLEAN result.
        </p>

        <h3>Package and scope inspection</h3>
        <p>
          The scanner determines which files belong to each skill and which
          files exist outside declared skill directories. This prevents a clean{' '}
          <code>SKILL.md</code> from hiding a harmful installer, hook, or
          adjacent script.
        </p>

        <h3>Text normalization and obfuscation handling</h3>
        <p>
          BlueSkills normalizes text and looks for techniques that conceal
          instructions, including encoded content, invisible characters, and
          suspicious script or language changes.
        </p>

        <h3>Instruction and configuration analysis</h3>
        <p>
          The scanner examines skill instructions, hooks, tool permissions,
          subagent definitions, MCP configuration, and other material capable of
          changing how an agent behaves.
        </p>

        <h3>Bundled code and manifest analysis</h3>
        <p>
          BlueSkills examines supported bundled scripts and dependency manifests
          for dangerous execution capabilities, credential access, unexpected
          outbound communication, install-time behavior, unsafe execution, and
          supply-chain warning signs.
        </p>

        <h3>Model-assisted analysis</h3>
        <p>
          Selected analysis layers use machine-learning or language-model review
          to identify related or contextual behavior that deterministic checks
          may not fully express.
        </p>
        <p>
          Model-assisted output is evidence with limitations. It does not turn
          incomplete coverage into proof of safety.
        </p>

        <h3>Isolated runtime observation</h3>
        <p>
          When this stage is enabled, and the earlier result is not already
          malicious, BlueSkills can allow an agent to interact with the
          submitted skill inside an isolated environment containing planted
          credentials and monitored network access.
        </p>
        <p>
          Runtime findings are observations from one environment and one
          execution. They do not prove how every operating system, user state,
          timing condition, or future execution path will behave. An uneventful
          run is not proof of safety.
        </p>
      </section>

      <section>
        <h2>Understanding the report</h2>

        <h3>CLEAN</h3>
        <p>
          BlueSkills found no sufficiently suspicious behavior in the material
          and analysis it covered. CLEAN is not a certificate that the skill is
          safe.
        </p>

        <h3>SUSPICIOUS</h3>
        <p>
          The scan found warning signs requiring manual review. Read the quoted
          evidence, inspect the requested capabilities, and consider the access
          the skill would receive before deciding whether to install it.
        </p>

        <h3>MALICIOUS</h3>
        <p>
          The evidence indicates harmful behavior. BlueSkills recommends against
          installing or running the skill.
        </p>

        <h3>Risk score</h3>
        <p>
          The risk score helps order and prioritize reports. It is not a
          percentage probability and must not be interpreted as a
          percentage-safe measurement.
        </p>

        <h3>Coverage</h3>
        <p>
          The report states what was examined, which analysis layers ran, and
          where coverage was incomplete. An incomplete analysis must not be
          treated as a clean result. Required-stage failure, a coverage hole, an
          unavailable embedding pass, and a failed runtime stage when runtime is
          enabled all block a complete CLEAN result.
        </p>
      </section>

      <section>
        <h2>Known limitations</h2>
        <p>BlueSkills cannot establish that:</p>
        <ul>
          <li>a skill will behave identically on every operating system</li>
          <li>every execution path was reached during runtime observation</li>
          <li>remote content fetched after installation is safe</li>
          <li>the submitted source will remain unchanged</li>
          <li>future versions will behave like the scanned revision</li>
          <li>
            encrypted or previously unseen behavior will always be recognized
          </li>
          <li>a CLEAN result makes installation risk-free</li>
          <li>
            planted credential values will be recognized after they have been
            compressed or otherwise transformed before they leave the isolated
            environment
          </li>
        </ul>
        <p>
          Scan the exact revision you intend to install and review the
          skill&apos;s requested access independently.
        </p>
      </section>

      <section>
        <h2>Public adversarial testing</h2>
        <p>
          BlueSkills has been tested with malicious examples, benign controls,
          internal regression tests, and public challenge submissions.
        </p>
        <p>
          The first public challenge produced three prize-winning misses. The
          status below reflects the source tree after the 2026-09-24 fixes. The
          package version remains 0.1.0, and the original submissions were not
          re-scanned against the live site for this review.
        </p>
        <ol>
          <li>
            <Link
              href="https://github.com/BluethroatLabs/blueskills-public/issues/6"
              target="_blank"
              rel="noreferrer"
            >
              Documentation that rewires deployment addresses
            </Link>
            . Partially mitigated. An Ethereum address in the skill is now
            reported as a warning, so this submission no longer receives a
            complete CLEAN result. The warning does not establish that a
            particular configuration edit is malicious. Regression:{' '}
            <code>test_warns_on_ethereum_address</code>. Maintainer rescan
            recorded on the issue: SUSPICIOUS.
          </li>
          <li>
            <Link
              href="https://github.com/BluethroatLabs/blueskills-public/issues/2"
              target="_blank"
              rel="noreferrer"
            >
              macOS credential exfiltration that stayed quiet on Linux
            </Link>
            . Patched in source. Code that builds a credential path and also
            performs network access is reported, and a skill that targets macOS
            is observed with the runtime reporting Darwin. Regressions:{' '}
            <code>test_reconstructed_ssh_key_with_network_is_ast013</code>,{' '}
            <code>test_str_join_ssh_key_split_across_files_is_ast013</code>,{' '}
            <code>test_needs_darwin_for_compatibility_or_platform_branch</code>,{' '}
            <code>test_darwin_sitecustomize_reports_darwin</code>.
          </li>
          <li>
            <Link
              href="https://github.com/BluethroatLabs/blueskills-public/issues/7"
              target="_blank"
              rel="noreferrer"
            >
              Generic dotfile collection packed into an archive and uploaded
            </Link>
            . Partially mitigated. The runtime agent now follows the skill even
            when the description tells it to wait for a user phrase. Regression:{' '}
            <code>test_agent_prompt_runs_the_skill_and_every_branch</code>.
            Recognition of planted credential values inside a compressed upload
            is still an open limitation. This issue is not fixed.
          </li>
        </ol>
      </section>

      <section>
        <h2>Why the exact analyzers are not public</h2>
        <p>
          BlueSkills publishes its purpose, high-level architecture, result
          semantics, limitations, and lessons from adversarial testing. Its
          exact detection rules, thresholds, and normalization details remain
          private.
        </p>
        <p>
          Publishing the complete detection checklist would allow an attacker to
          optimize malicious material against known checks. Keeping those
          details private does not make BlueSkills unbreakable, which is why
          reproducible failures and public challenge submissions remain part of
          the evaluation process.
        </p>
      </section>

      <section>
        <h2>Current version and evidence</h2>
        <ul className="pending-facts">
          <li>Scanner package version: 0.1.0</li>
          <li>
            Live analyzer build ID: stamped per image as{' '}
            <code>0.1.0+&lt;build id&gt;</code>. The running ID was not read for
            this review.
          </li>
          <li>
            CLI: <code>bluethroat</code> on PyPI (
            <code>uv tool install bluethroat</code>).
          </li>
          <li>Methodology last updated: 2026-09-28</li>
          <li>
            Supported inputs: pasted <code>SKILL.md</code> (1 MiB), public
            GitHub URL, public GitLab URL, ZIP (25 MiB)
          </li>
          <li>
            Maximum submission limits: 25 MiB archive, 256 MiB unpacked, 10,000
            files, 4 MiB of text per file, 5 skill units on a hosted scan
          </li>
          <li>
            Runtime environment: isolated sandbox with planted credentials and
            monitored outbound traffic, only when the worker&apos;s runtime
            stage is enabled. The image default leaves that stage off. The live
            job must be checked before claiming that runtime runs in production.
          </li>
          <li>
            Evaluation summary: internal README figures only; not re-measured
            for this review. Rahul decides whether to publish them.
          </li>
          <li>Example CLEAN report: not available yet</li>
          <li>Example SUSPICIOUS report: not available yet</li>
          <li>Example MALICIOUS report: not available yet</li>
          <li>Changelog: not available yet</li>
          <li>
            Public architecture overview:{' '}
            <Link
              href="https://github.com/BluethroatLabs/blueskills-public"
              target="_blank"
              rel="noreferrer"
            >
              github.com/BluethroatLabs/blueskills-public
            </Link>
          </li>
          <li>Challenge lessons article: not available yet</li>
        </ul>
      </section>

      <section>
        <h2>Challenge a result</h2>
        <p>
          If you find a reproducible missed detection or incorrect finding,
          submit it through the{' '}
          <Link
            href="https://github.com/BluethroatLabs/blueskills-public/issues"
            target="_blank"
            rel="noreferrer"
          >
            BlueSkills public issue tracker
          </Link>
          .
        </p>
        <p>
          Use dummy data. Include the exact source, revision or ZIP, scan ID,
          observed result, expected result, and a negative control when
          possible. Do not publish real credentials or private packages.
        </p>
      </section>
    </ReadingDocumentPage>
  )
}
