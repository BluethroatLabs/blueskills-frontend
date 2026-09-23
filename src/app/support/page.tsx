import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Support — BlueSkills' }

export default function SupportPage() {
  return (
    <LegalPage title="Support">
      <p className="font-medium text-(--ink)">
        Support for BlueSkills, operated by Bluethroat Labs.
      </p>

      <p>
        Open a{' '}
        <a
          href="https://github.com/BluethroatLabs/blueskills-public/issues"
          target="_blank"
          rel="noreferrer"
        >
          GitHub issue
        </a>
        . Include the <code>scan_id</code> from the report when you have one. Do
        not paste secrets.
      </p>

      <p>This website does not offer email support.</p>

      <p>
        If you use the{' '}
        <a
          href="https://t.me/BluethroatLabsBot"
          target="_blank"
          rel="noreferrer"
        >
          Telegram bot
        </a>
        , send /start, then <strong>Report an Issue</strong>.
      </p>

      <section>
        <h3>Retention</h3>
        <ul className="mt-3">
          <li>
            Work artifacts (<code>input.zip</code> and sandbox{' '}
            <code>runtime/</code> logs): 7 days.
          </li>
          <li>
            Scan results (<code>result.json</code>): 30 days.
          </li>
          <li>Azure Container Apps logs: 30 days.</li>
        </ul>
      </section>

      <p>
        Private GitHub/GitLab repositories and private package contents are not
        accepted. Use a public URL, or a zip that contains only material you are
        allowed to share publicly.
      </p>

      <p>
        More information on BlueSkills architecture is in the{' '}
        <a
          href="https://github.com/BluethroatLabs/blueskills-public"
          target="_blank"
          rel="noreferrer"
        >
          public repository
        </a>
        .
      </p>
    </LegalPage>
  )
}
