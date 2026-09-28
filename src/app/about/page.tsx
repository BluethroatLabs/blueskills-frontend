import type { Metadata } from 'next'
import Link from 'next/link'
import { Accordion, AccordionItem } from '@/components/Accordion'
import {
  AboutPageEnvironment,
  ParchmentArticle,
} from '@/components/content-page'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'About BlueSkills | AI Agent Skill Security Scanner',
  description:
    'Learn how BlueSkills analyzes AI agent skills, what each verdict means, what the scanner covers, and the limitations to consider before installation.',
  path: '/about',
})

const answerClasses = 'content-copy__answer'

export default function AboutPage() {
  return (
    <AboutPageEnvironment>
      <ParchmentArticle labelledBy="about-title">
        <header className="reading-page-header">
          <h1 id="about-title">About BlueSkills</h1>
          <p className="reading-page-header__lead">
            BlueSkills is the checkpoint between you and the skill a stranger
            sent you.
          </p>
        </header>

        <div className="content-copy content-copy--intro">
          <p>
            Paste a <code>SKILL.md</code>, point BlueSkills at a public GitHub
            or GitLab repository, or upload a ZIP package. BlueSkills analyzes
            the submitted material across several layers. It inspects
            instructions, bundled code, manifests, hooks, dependencies,
            configuration, and signs of obfuscation. On the hosted worker it
            also runs model-assisted review. Isolated runtime observation is a
            separate stage: it runs only when that stage is enabled, and it does
            not run when the earlier result is already malicious. The skill
            never runs on your machine. The report states which layers ran, what
            was examined, and any coverage gaps.
          </p>

          <p>
            You receive a verdict, a risk score out of 100, and the evidence
            associated with each finding. Findings identify the file, line,
            relevant evidence, and why the behavior may be dangerous. A risk
            score orders reports. It is not a probability that the skill is
            safe.
          </p>
          <p>
            BlueSkills does not certify safety. It gives you evidence about the
            submitted material so you can make a better decision before an agent
            reads or installs it.
          </p>
        </div>

        <section className="reading-section" aria-labelledby="faq-title">
          <h2 id="faq-title">Frequently asked questions</h2>

          <Accordion className="content-accordion">
            <AccordionItem number="01" question="What is BlueSkills?">
              <p className={answerClasses}>
                BlueSkills is a security scanner for AI agent skills. It
                examines <code>SKILL.md</code> and, when you submit a repository
                or ZIP, the surrounding scripts, manifests, hooks, dependencies,
                configuration, and other package files. Its purpose is to show
                you evidence and coverage before you decide whether to install
                the skill.
              </p>
            </AccordionItem>

            <AccordionItem number="02" question="Is BlueSkills free?">
              <p className={answerClasses}>
                Yes. BlueSkills is a free public tool from Bluethroat Labs. The
                web scanner and the Telegram bot accept pasted{' '}
                <code>SKILL.md</code> files, public GitHub and GitLab repository
                URLs, and ZIP packages. Fair-use limits are enforced by the
                service.
              </p>
            </AccordionItem>

            <AccordionItem
              number="03"
              question="Does CLEAN mean a skill is safe?"
            >
              <p className={answerClasses}>
                No. CLEAN means BlueSkills found no sufficiently suspicious
                behavior in the material and analysis it covered. It does not
                prove that the skill is safe, that every execution path was
                reached, or that a later version will behave the same way.
              </p>
            </AccordionItem>

            <AccordionItem number="04" question="How long does a scan take?">
              <p className={answerClasses}>
                BlueSkills performs several forms of analysis rather than a
                single pattern match. Completion time depends on the submission
                size, analysis required, and current service demand. The
                interface shows when a report is still being prepared. A hosted
                report can be retrieved later with its scan ID while the result
                is still retained.
              </p>
            </AccordionItem>

            <AccordionItem
              number="05"
              question="What do CLEAN, SUSPICIOUS, and MALICIOUS mean?"
            >
              <p className={answerClasses}>
                <strong>CLEAN</strong> means BlueSkills found no sufficiently
                suspicious behavior in the material and analysis it covered. It
                does not prove that the skill is safe.{' '}
                <strong>SUSPICIOUS</strong> means the scan found warning signs
                that require manual review. <strong>MALICIOUS</strong> means the
                evidence indicates harmful behavior and BlueSkills recommends
                against installing or running the skill.
              </p>
              <p className={answerClasses}>
                An incomplete, invalid, partial, or failed scan is a different
                result. Do not read it as CLEAN.
              </p>
            </AccordionItem>

            <AccordionItem
              number="06"
              question="Can I scan a private repository?"
            >
              <p className={answerClasses}>
                No. Private repositories are not fetched. Public GitHub and
                GitLab URLs only. Do not upload secrets, credentials, customer
                code, or other material you are not authorized to share.
                Uploading a ZIP is not a private-repository integration.
              </p>
            </AccordionItem>

            <AccordionItem
              number="07"
              question="What happens if a repository contains several skills?"
            >
              <p className={answerClasses}>
                Each skill folder is scanned separately. Files outside the
                declared skill folders, such as hooks, installers, or adjacent
                scripts, are also examined as package material. The headline
                result reflects the most severe result in the submitted package.
                A hosted scan covers up to five skill units; if the package
                contains more, the report says the scan stopped early and that
                remainder is not a clean result. Review every reported unit
                before making an installation decision.
              </p>
            </AccordionItem>

            <AccordionItem
              number="08"
              question="Why is BlueSkills not open source?"
            >
              <div className={answerClasses}>
                <p>
                  BlueSkills publishes its purpose, high-level architecture,
                  result semantics, limitations, and lessons from adversarial
                  testing. Its exact detection rules, thresholds, and
                  normalization details remain private because publishing the
                  complete detection checklist would help an attacker tune
                  malicious material against known checks.
                </p>
                <p>
                  Keeping those details private does not make BlueSkills
                  unbreakable. The public repository provides architecture
                  information and a place to submit reproducible missed
                  detections and incorrect results.
                </p>
                <p>
                  <Link
                    href="https://github.com/BluethroatLabs/blueskills-public"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the public architecture overview
                  </Link>
                </p>
              </div>
            </AccordionItem>
          </Accordion>
        </section>

        <footer className="reading-page-footer">
          <p>BlueSkills by Bluethroat Labs</p>
        </footer>
      </ParchmentArticle>
    </AboutPageEnvironment>
  )
}
