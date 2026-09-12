function SectionHeader({ eyebrow, title, description, align = 'left' }) {
  return (
    <div
      className={`flex flex-col gap-2 ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} mb-6 md:mb-8`}
    >
      {eyebrow ? (
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="m-0 text-[clamp(2.1rem,3vw,3rem)] leading-[1.05] tracking-[-0.06em] text-[var(--text)]">
        {title}
      </h2>
      {description ? (
        <p className="m-0 max-w-[42rem] text-base leading-7 text-[var(--text-muted)]">{description}</p>
      ) : null}
    </div>
  )
}

export default SectionHeader
