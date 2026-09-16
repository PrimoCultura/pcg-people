import type { Person } from "@/data/types";

type PersonResponsibilitiesProps = {
  items: Person["canHelpWith"];
};

export function PersonResponsibilities({ items }: PersonResponsibilitiesProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="person-help-heading">
      <h2
        id="person-help-heading"
        className="text-xl font-semibold tracking-tight text-pcg-ink"
      >
        Puoi rivolgerti a me per
      </h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="border-l border-pcg-border pl-4 text-base leading-relaxed text-pcg-text-secondary"
          >
            {formatHelpItem(item)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatHelpItem(item: string): string {
  if (!item) return item;
  return item.charAt(0).toUpperCase() + item.slice(1);
}
