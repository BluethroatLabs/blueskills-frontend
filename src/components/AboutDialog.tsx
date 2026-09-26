import Link from 'next/link'
import { Accordion, AccordionItem } from './Accordion'
import { ScrollDialog } from './ScrollDialog'

const paperClasses = [
  'relative mx-auto mb-10 w-[min(55rem,calc(100%_-_6.25rem))] px-4',
  '[--scroll-ink:#161616] [--scroll-muted:#3e3e3e] [--scroll-rule:#16161630]',
  '[border-width:6.25rem_4rem_5.75rem] [border-style:solid] border-transparent',
  "[border-image:url('/assets/privacy-scroll.png')_230_125_215_125_fill/6.25rem_4rem_5.75rem/0_stretch]",
  'text-(--scroll-ink) [color-scheme:light] drop-shadow-[0_1.125rem_1.25rem_#0008]',
  '[&_a]:text-(--scroll-ink) [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4',
  '[&_a]:[overflow-wrap:anywhere] [&_a:hover]:decoration-2',
  '[&_code]:border [&_code]:border-(--scroll-rule) [&_code]:px-1 [&_code]:py-[0.05rem] [&_code]:text-[0.9em]',
  '[&_strong]:font-[650]',
  'max-[47.5rem]:mb-6 max-[47.5rem]:w-[calc(100%_-_2rem)] max-[47.5rem]:px-3',
  'max-[47.5rem]:[border-width:6.25rem_2.5rem_5.9375rem] max-[47.5rem]:[border-image-width:6.25rem_2.5rem_5.9375rem]',
  'max-[30rem]:w-[calc(100%_-_0.5rem)] max-[30rem]:px-3',
  'max-[30rem]:[border-width:4rem_1.375rem_3.75rem] max-[30rem]:[border-image-width:4rem_1.375rem_3.75rem]',
  'forced-colors:[--scroll-ink:CanvasText] forced-colors:[--scroll-muted:CanvasText]',
  'forced-colors:[border-image:none] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:filter-none',
].join(' ')

const headerClasses = [
  'px-2 pb-5 text-center max-[30rem]:px-0 max-[30rem]:pb-4.5',
  '[&_h2]:mx-0 [&_h2]:mt-0 [&_h2]:mb-5 [&_h2]:font-serif',
  '[&_h2]:text-[clamp(2.5rem,7vw,3.75rem)] [&_h2]:leading-[1.1] [&_h2]:font-normal',
  '[&_h2]:tracking-[-0.02em] [&_h2]:text-balance',
  '[&_p]:mx-auto [&_p]:mt-0 [&_p]:mb-4 [&_p]:max-w-[68ch]',
  '[&_p]:text-lg [&_p]:leading-[1.65] [&_p]:text-(--scroll-ink)',
  '[&_p:last-child]:mb-0 max-[30rem]:[&_p]:text-base',
].join(' ')

const answerClasses =
  'mb-3.5 max-w-[72ch] text-[1.0625rem] leading-[1.65] text-(--scroll-muted) max-[30rem]:text-base'

// const workflowListClasses = [
//   'mt-1 mb-0 space-y-2 text-base leading-[1.65] text-(--scroll-muted)',
//   '[&_li]:pl-1.5 [&_li+li]:mt-2.5',
//   '[&_li::marker]:text-(--scroll-ink) [&_li::marker]:tabular-nums',
// ].join(' ')

export function AboutDialog() {
  return (
    <ScrollDialog
      trigger="About"
      triggerClassName="flex cursor-pointer items-center border-0 border-l border-(--rule) bg-transparent px-4 text-sm font-semibold text-(--ink-2) transition-colors hover:bg-(--panel-2) hover:text-(--ink) sm:px-5 sm:text-base"
      closeLabel="Close About BlueSkills"
      labelledBy="about-blueskills-title"
      describedBy="about-blueskills-intro"
    >
      <article className={paperClasses}>
        <header className={headerClasses}>
          <h2 id="about-blueskills-title">About BlueSkills</h2>
          <p id="about-blueskills-intro">
            BlueSkills is the checkpoint between you and the skill a stranger
            sent you.
          </p>
          <p>
            Paste a <code>SKILL.md</code>, point it at a public repo, or upload
            a zipped package. BlueSkills statically inspects the prose, bundled
            scripts, dependency manifests, hooks and MCP config. The skill never
            runs on your machine.
          </p>
          <p>
            You get back a verdict, a risk score out of 100, and the quoted line
            that triggered each finding. Should you install it? Each finding
            shows the file, the line, the evidence, and why that is dangerous.
          </p>
          <p>
            BlueSkills does not certify safety. It tells you what the skill
            appears to do, so you can decide before an agent reads it.
          </p>
        </header>

        <Accordion>
          <AccordionItem number="01" question="What is BlueSkills?">
            <p className={answerClasses}>
              BlueSkills is a security scanner for{' '}
              <Link href="https://agentskills.io" target="_blank">
                agent skills
              </Link>
              . It tries to find hidden malicious behaviour of a{' '}
              <code>SKILL.md</code>
            </p>
          </AccordionItem>

          <AccordionItem number="02" question="Is BlueSkills free?">
            <p className={answerClasses}>
              Yes. BlueSkills is a free public tool from Bluethroat Labs. The
              web scanner accepts pasted <code>SKILL.md</code> files, public
              repository URLs and ZIP packages.
            </p>
          </AccordionItem>

          <AccordionItem
            number="03"
            question="Does CLEAN mean a skill is safe?"
          >
            <p className={answerClasses}>
              No. CLEAN describes this scan of the submitted material. It cannot
              certify behavior on every platform or after the skill changes.
            </p>
          </AccordionItem>

          <AccordionItem number="04" question="How long does a scan take?">
            <p className={answerClasses}>
              Because it&apos;s not a simple regexp scan, it usually takes a few
              minutes.
            </p>
          </AccordionItem>

          <AccordionItem
            number="05"
            question="What do CLEAN, SUSPICIOUS, and MALICIOUS mean?"
          >
            <p className={answerClasses}>
              CLEAN means that the scanner didn&apos;t find anything suspicious
              enough it doesn&apos;t mean that skill is safe to install.
              SUSPICIOUS means there&apos;re a few red flags, we advise you to
              manually check the skill. MALICIOUS means that we do not recommend
              to interact with this skill.
            </p>
          </AccordionItem>

          <AccordionItem
            number="06"
            question="Can I scan a private repository?"
          >
            <p className={answerClasses}>
              No, private repositories are not supported.
            </p>
          </AccordionItem>

          <AccordionItem
            number="07"
            question="What happens if a repo contains several skills?"
          >
            <p className={answerClasses}>
              Each skill folder is scanned on its own, and anything left over —
              a hook, an <code>install.sh</code>, a script sitting next to the
              skills — is scanned as a separate unit called files outside any
              skill. The headline you see is the worst of those verdicts. One
              clean skill next to a hostile hook is a hostile package.
            </p>
          </AccordionItem>

          <AccordionItem
            number="08"
            question="Why is BlueSkills not open source?"
          >
            <p className={answerClasses}>
              The scanner stays unpublished so a skill author cannot read the
              rules, thresholds, normalizer, and sandbox checks and tune a
              package to slip under them. Publishing that checklist would make
              the check easier to evade than to trust. You can read the
              architecture overview in the{' '}
              <Link
                href="https://github.com/BluethroatLabs/blueskills-public"
                target="_blank"
              >
                public repository
              </Link>
              .
            </p>
          </AccordionItem>

          {/* <AccordionItem
            number="09"
            question="How do I scan an AI agent skill before installing it?"
          >
            <div className={workflowListClasses}>
              <p>
                Get the exact public repository or ZIP you intend to install.
                Paste <code>SKILL.md</code> only when you want a one-file check.
              </p>
              <p>
                Submit it above, then read the findings and coverage. A CLEAN
                result means this scan found no supported issue in the material
                it examined.
              </p>
              <p>
                Review the skill and the access your agent will have. Decide
                whether to install that same revision.
              </p>

              <p className={`${answerClasses} mt-4 mb-0 text-base`}>
                Using an agent to install skills?{' '}
                <Link href="/for-agents">
                  Give it the pre-install review workflow
                </Link>
                .
              </p>
            </div>
          </AccordionItem> */}
        </Accordion>

        <footer className="pt-5 text-center">
          <p className="m-0 font-serif text-2xl leading-[1.65] font-medium text-(--scroll-muted)">
            BlueSkills by Bluethroat Labs
          </p>
        </footer>
      </article>
    </ScrollDialog>
  )
}
