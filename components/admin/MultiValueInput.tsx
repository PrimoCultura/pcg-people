"use client";

import { useState } from "react";

type MultiValueInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export function MultiValueInput({
  label,
  values,
  onChange,
  placeholder = "Aggiungi e premi Invio",
}: MultiValueInputProps) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const next = draft.trim();
    if (!next) return;
    if (values.includes(next)) {
      setDraft("");
      return;
    }
    onChange([...values, next]);
    setDraft("");
  };

  return (
    <div>
      <p className="text-sm font-medium text-pcg-ink">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <li
            key={value}
            className="inline-flex items-center gap-2 rounded-pcg border border-pcg-border bg-pcg-bg px-2.5 py-1 text-sm text-pcg-text"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== value))}
              className="text-pcg-text-muted hover:text-pcg-primary"
              aria-label={`Rimuovi ${value}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-10 flex-1 rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm outline-none focus:border-pcg-primary"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-pcg border border-pcg-border px-3 text-sm font-medium text-pcg-primary hover:bg-pcg-primary-soft"
        >
          Aggiungi
        </button>
      </div>
    </div>
  );
}
