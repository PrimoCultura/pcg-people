type DepartmentContactForProps = {
  items: string[];
};

export function DepartmentContactFor({ items }: DepartmentContactForProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="department-contact-heading">
      <h2
        id="department-contact-heading"
        className="text-xl font-semibold tracking-tight text-pcg-ink"
      >
        Puoi rivolgerti a noi per
      </h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="border-l border-pcg-border pl-4 text-base leading-relaxed text-pcg-text-secondary"
          >
            {formatItem(item)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatItem(item: string): string {
  if (!item) return item;
  return item.charAt(0).toUpperCase() + item.slice(1);
}
