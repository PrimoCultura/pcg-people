type PersonTagsProps = {
  tags: string[];
};

export function PersonTags({ tags }: PersonTagsProps) {
  if (tags.length === 0) return null;

  return (
    <section aria-labelledby="person-tags-heading">
      <h2
        id="person-tags-heading"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted"
      >
        Ambiti
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-pcg-text-muted">
        {tags.join(" · ")}
      </p>
    </section>
  );
}
