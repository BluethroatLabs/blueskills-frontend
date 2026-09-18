import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Support — BlueSkills' }

export default function SupportPage() {
  return (
    <LegalPage title="Support">
      <p className="font-medium text-(--ink)">Support — Bluethroat Labs</p>

      <p>
        Telegram: send /start, then <strong>Report an Issue</strong>. Include
        the <code>scan_id</code> from the report when you have one. Do not paste
        secrets.
      </p>

      <p>
        You can also submit issues at{' '}
        <a
          href="https://github.com/BluethroatLabs/blueskills-public/issues"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/BluethroatLabs/blueskills-public/issues
        </a>
      </p>

      <p>This bot does not offer email support.</p>

      <section>
        <h3>Retention</h3>
        <p className="mt-3">
          Work artefacts (<code>input.zip</code> and sandbox{' '}
          <code>runtime/</code> logs): 7 days. Scan results ({' '}
          <code>result.json</code>): 30 days. Azure Container Apps logs: 30
          days. On Telegram, /delete removes your identifiers after
          confirmation. For a specific report, include the <code>scan_id</code>{' '}
          via <strong>Report an Issue</strong>.
        </p>
      </section>

      <p>
        Private GitHub/GitLab repositories and private package contents are not
        accepted. Use a public URL, or a zip that contains only material you are
        allowed to share publicly.
      </p>

      <p>
        More information on BlueSkills architecture:{' '}
        <a
          href="https://github.com/BluethroatLabs/blueskills-public"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/BluethroatLabs/blueskills-public
        </a>
      </p>
    </LegalPage>
  )
}
