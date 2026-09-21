import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Terms — BlueSkills' }

export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p className="font-medium text-(--ink)">
        Website terms of use for BlueSkills, operated by Bluethroat Labs.
      </p>

      <p>
        BlueSkills is a static and dynamic scanner for Agent Skill packages. On
        this website you submit a pasted <code>SKILL.md</code>, a public GitHub
        or GitLab URL, or a <code>.zip</code> of the package. The scan reports
        whether that package looks CLEAN, SUSPICIOUS, MALICIOUS, invalid, or
        only partially analysed.
      </p>

      <p>
        The report is not a warranty, not a sandbox for the agent you will
        actually run, and not permission to install a skill. Verdicts can be
        incomplete when a required stage does not finish; an incomplete scan is
        never a CLEAN result.
      </p>

      <p>
        You must not submit private repositories, private package contents,
        malware for execution outside this scanner&apos;s sandbox, or content
        you are not allowed to share. Public GitHub and GitLab URLs only. Do not
        upload secrets, API keys, private keys, or <code>.env</code> files with
        real credentials.
      </p>

      <p>
        This website rate-limits by network address and caps paid analysis per
        day. The Telegram bot uses identity-based daily limits (scans, issue
        reports, and BluePaper conversions). A Cloudflare Turnstile check may be
        required before a scan.
      </p>

      <p>Bluethroat Labs may refuse, rate-limit, or drop submissions.</p>
    </LegalPage>
  )
}
