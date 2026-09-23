import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Privacy — BlueSkills' }

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p className="font-medium text-(--ink)">Privacy — Bluethroat Labs</p>

      <p>BlueSkills is operated by Bluethroat Labs.</p>

      <section>
        <h2>What we collect</h2>
        <ul className="mt-3">
          <li>
            The skill you submit (pasted <code>SKILL.md</code>, uploaded{' '}
            <code>.zip</code>, or the public GitHub/GitLab archive we fetch).
          </li>
          <li>
            For the Telegram bot: your Telegram user id, chat id, and the
            message we need to reply to.
          </li>
          <li>
            Documents you send to BluePaper (PDF, Word, or image). Those bytes
            are uploaded to the BluePaper conversion service and are not stored
            by BlueSkills.
          </li>
          <li>
            Scan reports (findings, scores, stage logs). Runtime logs from a
            sandbox, when deep analysis runs.
          </li>
        </ul>
      </section>

      <section>
        <h2>What we do not want</h2>
        <p className="mt-3">
          Do not upload secrets, API keys, private keys, <code>.env</code> files
          with real credentials, or private repository or private package
          contents. Public GitHub and GitLab URLs only; private repositories are
          not fetched, and a zip of a private package is not an accepted
          substitute. Do not send documents to BluePaper that you are not
          allowed to share with the conversion service.
        </p>
      </section>

      <section>
        <h2>Subprocessors</h2>
        <ul className="mt-3">
          <li>Telegram (bot delivery)</li>
          <li>OpenRouter (optional embedding, judge, and executor models)</li>
          <li>Azure (hosted storage, queues, and ACA sandboxes)</li>
          <li>
            Cloudflare Turnstile (website scan button, when the operator has
            enabled it)
          </li>
          <li>
            BluePaper conversion API (Azure Container Apps; same operator).
            BlueMask runs on your device and does not upload the image to
            BlueSkills.
          </li>
        </ul>
      </section>

      <section>
        <h2>Retention</h2>
        <ul className="mt-3">
          <li>
            Work artefacts (<code>input.zip</code> and sandbox{' '}
            <code>runtime/</code> logs): 7 days, then deleted by the store
            lifecycle policy.
          </li>
          <li>
            Scan results (<code>result.json</code>): 30 days, then deleted by
            the store lifecycle policy.
          </li>
          <li>Azure Container Apps runtime logs (Log Analytics): 30 days.</li>
        </ul>
        <p className="mt-3">
          Deletion is automatic at those deadlines. On the Telegram bot, send
          /delete (also /delete_data or /privacy_delete) to remove identifiers,
          session, quota tokens, and bot job records for your Telegram user id
          after a confirmation step. That also unlinks your Telegram user id
          from in-retention scan records. Scan result blobs themselves are keyed
          by the skill bytes, not by Telegram user, so they are not purged by
          /delete; they expire on the schedule above. Include the{' '}
          <code>scan_id</code> via <strong>Report an Issue</strong> if you need
          a specific result removed sooner. The website /delete page describes
          the same path. Telegram messages follow Telegram&apos;s own retention.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p className="mt-3">
          Use /support on the bot, or the Support page on the website.
        </p>
      </section>
    </LegalPage>
  )
}
