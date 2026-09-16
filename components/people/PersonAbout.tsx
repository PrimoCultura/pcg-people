type PersonAboutProps = {
  description: string;
};

export function PersonAbout({ description }: PersonAboutProps) {
  return (
    <section aria-labelledby="person-about-heading">
      <h2
        id="person-about-heading"
        className="text-xl font-semibold tracking-tight text-pcg-ink"
      >
        Di cosa mi occupo
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-pcg-text-secondary">
        {description}
      </p>
    </section>
  );
}
