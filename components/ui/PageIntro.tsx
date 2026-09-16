type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-pcg-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-pcg-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-pcg-text-secondary sm:text-lg">
        {description}
      </p>
    </div>
  );
}
