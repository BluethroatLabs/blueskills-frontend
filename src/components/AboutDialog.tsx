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

const questionsClasses = [
  'm-0 list-none p-0',
  '[&>li]:relative [&>li]:border-t [&>li]:border-(--scroll-rule)',
  '[&>li:last-child]:border-b',
].join(' ')

const summaryClasses = [
  'flex min-h-13 list-none items-center gap-3 py-3.5',
  'text-[1.0625rem] leading-[1.55] font-[650] text-(--scroll-ink)',
  '[&::-webkit-details-marker]:hidden',
  'max-[30rem]:gap-2 max-[30rem]:text-base',
].join(' ')

const numberClasses = 'shrink-0 text-sm font-normal text-[#555] tabular-nums'

const markerClasses = 'ml-auto inline-flex shrink-0 pl-2 max-[30rem]:pl-0'

const markerIconClasses =
  'size-4.5 fill-none stroke-current [stroke-width:1.25]'

const answerClasses =
  'mb-3.5 max-w-[72ch] text-[1.0625rem] leading-[1.65] text-(--scroll-muted) max-[30rem]:text-base'

const workflowListClasses = [
  'mt-1 mb-0 space-y-2 text-base leading-[1.65] text-(--scroll-muted)',
  '[&_li]:pl-1.5 [&_li+li]:mt-2.5',
  '[&_li::marker]:text-(--scroll-ink) [&_li::marker]:tabular-nums',
].join(' ')

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

        <ol className={questionsClasses}>
          <li>
            <details className="group open:pb-3">
              <summary className={summaryClasses}>
                <span className={numberClasses} aria-hidden="true">
                  01
                </span>
                <span>
                  How do I scan an AI agent skill before installing it?
                </span>
                <span className={markerClasses} aria-hidden="true">
                  <svg
                    viewBox="0 0 18 18"
                    className={`${markerIconClasses} group-open:hidden`}
                  >
                    <path d="M9 3v12M3 9h12" />
                  </svg>
                  <svg
                    viewBox="0 0 18 18"
                    className={`${markerIconClasses} hidden group-open:block`}
                  >
                    <path d="M3 9h12" />
                  </svg>
                </span>
              </summary>

              <div className={workflowListClasses}>
                <p>
                  Get the exact public repository or ZIP you intend to install.
                  Paste <code>SKILL.md</code> only when you want a one-file
                  check.
                </p>
                <p>
                  Submit it above, then read the findings and coverage. A CLEAN
                  result means this scan found no supported issue in the
                  material it examined.
                </p>
                <p>
                  Review the skill and the access your agent will have. Decide
                  whether to install that same revision.
                </p>

                {/* <p className={`${answerClasses} mt-4 mb-0 text-base`}>
                  Using an agent to install skills?{' '}
                  <Link href="/for-agents">
                    Give it the pre-install review workflow
                  </Link>
                  .
                </p> */}
              </div>
            </details>
          </li>

          <li>
            <details className="group open:pb-3">
              <summary className={summaryClasses}>
                <span className={numberClasses} aria-hidden="true">
                  02
                </span>
                <span>Is BlueSkills free?</span>
                <span className={markerClasses} aria-hidden="true">
                  <svg
                    viewBox="0 0 18 18"
                    className={`${markerIconClasses} group-open:hidden`}
                  >
                    <path d="M9 3v12M3 9h12" />
                  </svg>
                  <svg
                    viewBox="0 0 18 18"
                    className={`${markerIconClasses} hidden group-open:block`}
                  >
                    <path d="M3 9h12" />
                  </svg>
                </span>
              </summary>

              <div>
                <p className={answerClasses}>
                  Yes. BlueSkills is a free public tool from Bluethroat Labs.
                  The web scanner accepts pasted SKILL.md files, public
                  repository URLs and ZIP packages.
                </p>
              </div>
            </details>
          </li>

          <li>
            <details className="group open:pb-3">
              <summary className={summaryClasses}>
                <span className={numberClasses} aria-hidden="true">
                  03
                </span>
                <span>Does CLEAN mean a skill is safe?</span>
                <span className={markerClasses} aria-hidden="true">
                  <svg
                    viewBox="0 0 18 18"
                    className={`${markerIconClasses} group-open:hidden`}
                  >
                    <path d="M9 3v12M3 9h12" />
                  </svg>
                  <svg
                    viewBox="0 0 18 18"
                    className={`${markerIconClasses} hidden group-open:block`}
                  >
                    <path d="M3 9h12" />
                  </svg>
                </span>
              </summary>

              <div>
                <p className={answerClasses}>
                  No. CLEAN describes this scan of the submitted material. It
                  cannot certify behavior on every platform or after the skill
                  changes.
                </p>
              </div>
            </details>
          </li>
        </ol>

        <footer className="pt-5 text-center">
          <p className="m-0 font-serif text-2xl leading-[1.65] font-medium text-(--scroll-muted)">
            BlueSkills by Bluethroat Labs
          </p>
        </footer>
      </article>
    </ScrollDialog>
  )
}
