export const CoveragePrimer = () => {
  return (
    <section className="grid border-y border-(--rule) bg-(--panel) md:grid-cols-2">
      <div className="p-4 sm:p-5 md:border-r md:border-(--rule)">
        <h2 className="font-serif text-2xl leading-none font-normal">
          What this scan covers
        </h2>
        <ul className="mt-4 space-y-3 pl-5 text-sm text-pretty text-(--ink-2) marker:text-(--ink)">
          <li>
            The unit of trust is the whole package: each SKILL.md, nearby
            scripts and config, plus files no skill folder claims.
          </li>
          <li>
            Pasted instructions are read as a one-file skill. Referenced files
            are not fetched.
          </li>
          <li>
            A report is one check of the submitted files. It does not watch the
            skill after installation.
          </li>
        </ul>
      </div>
      <div className="border-t border-(--rule) p-4 sm:p-5 md:border-t-0">
        <h2 className="font-serif text-2xl leading-none font-normal">
          Limits worth knowing
        </h2>
        <ul className="mt-4 space-y-3 pl-5 text-sm text-pretty text-(--ink-2) marker:text-(--ink)">
          <li>
            Instructions fetched later arrive after the scan. Their addresses
            may be listed, but their contents are not read.
          </li>
          <li>
            A runtime observation is one isolated run, not proof of what happens
            in your environment.
          </li>
          <li>
            Uninspected content has no result. A low triage score cannot clear
            it.
          </li>
        </ul>
      </div>
    </section>
  )
}
