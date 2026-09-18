import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Terms — BlueSkills' }

export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p className="font-medium text-(--ink)">Terms — Bluethroat Labs</p>

      <p>
        BlueSkills is a static and (when configured) dynamic scanner for Agent
        Skill packages. It reports whether a package looks clean, suspicious,
        malicious, invalid, or only partially analysed. The same Telegram bot
        also offers BluePaper (rebuild a document as a pixel PDF) and BlueMask
        (mask regions of a photo on your device).
      </p>

      <p>
        The report is not a warranty, not a sandbox for the agent you will
        actually run, and not permission to install a skill. Verdicts can be
        incomplete when a required stage does not finish; an incomplete scan is
        never a CLEAN result. A BluePaper PDF is a picture of the pages, not a
        finding that the original file was clean.
      </p>

      <p>
        You must not submit private repositories, private package contents,
        malware for execution outside this scanner&apos;s sandbox, or content
        you are not allowed to share. Public GitHub and GitLab URLs only.
      </p>

      <p>
        Identity-based daily limits (scans, issue reports, and BluePaper
        conversions) bound cost. They are not Sybil-proof.
      </p>

      <p>Bluethroat Labs may refuse, rate-limit, or drop submissions.</p>
    </LegalPage>
  )
}
