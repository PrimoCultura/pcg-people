"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MultiValueInput } from "@/components/admin/MultiValueInput";
import { getConvexUserMessage } from "@/lib/convexErrors";
import { getPersonFullName } from "@/data/types";
import { mapConvexPerson, type ConvexPersonDoc } from "@/lib/mappers";

type DeptFormState = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  headId: string;
  contactFor: string[];
  tags: string[];
  order: string;
  active: boolean;
};

const inputClass =
  "mt-1 h-10 w-full rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm outline-none focus:border-pcg-primary";

export function DepartmentForm({
  departmentId,
}: {
  departmentId?: Id<"departments">;
}) {
  const router = useRouter();
  const people = useQuery(api.people.listAll);
  const existing = useQuery(
    api.departments.getByIdAdmin,
    departmentId ? { id: departmentId } : "skip",
  );
  const create = useMutation(api.departments.create);
  const update = useMutation(api.departments.update);
  const [form, setForm] = useState<DeptFormState | null>(() =>
    departmentId
      ? null
      : {
          name: "",
          slug: "",
          shortDescription: "",
          description: "",
          headId: "",
          contactFor: [],
          tags: [],
          order: "",
          active: true,
        },
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const state = useMemo(() => {
    if (form) return form;
    if (departmentId) {
      if (!existing) return null;
      return {
        name: existing.name,
        slug: existing.slug,
        shortDescription: existing.shortDescription,
        description: existing.description,
        headId: existing.headId ?? "",
        contactFor: existing.contactFor,
        tags: existing.tags,
        order: existing.order?.toString() ?? "",
        active: existing.active,
      };
    }
    return {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      headId: "",
      contactFor: [] as string[],
      tags: [] as string[],
      order: "",
      active: true,
    };
  }, [form, departmentId, existing]);

  if (departmentId && existing === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }
  if (!state || people === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  const set = <K extends keyof DeptFormState>(
    key: K,
    value: DeptFormState[K],
  ) => {
    setForm({ ...state, [key]: value });
    setMessage(null);
    setError(null);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: state.name.trim(),
        shortDescription: state.shortDescription.trim(),
        description: state.description.trim(),
        headId: state.headId ? (state.headId as Id<"people">) : undefined,
        contactFor: state.contactFor,
        tags: state.tags,
        order: state.order ? Number(state.order) : undefined,
        active: departmentId ? state.active : (state.active ?? true),
      };
      if (departmentId) {
        await update({
          id: departmentId,
          ...payload,
          slug: state.slug.trim(),
          active: state.active,
        });
        setMessage("Dipartimento salvato");
      } else {
        const id = await create({
          ...payload,
          slug: state.slug.trim() || undefined,
        });
        setMessage("Dipartimento creato");
        router.push(`/admin/dipartimenti/${id}`);
      }
    } catch (err) {
      setError(getConvexUserMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const peopleOpts = (people as ConvexPersonDoc[])
    .filter((p) => p.active)
    .map(mapConvexPerson);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-pcg-ink">
        {departmentId ? "Modifica dipartimento" : "Nuovo dipartimento"}
      </h2>
      <label className="block text-sm font-medium">
        Nome
        <input
          required
          className={inputClass}
          value={state.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Slug
        <input
          className={inputClass}
          value={state.slug}
          onChange={(e) => set("slug", e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Descrizione breve
        <input
          required
          className={inputClass}
          value={state.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Descrizione
        <textarea
          required
          rows={4}
          className={inputClass}
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Responsabile
        <select
          className={inputClass}
          value={state.headId}
          onChange={(e) => set("headId", e.target.value)}
        >
          <option value="">Nessuno</option>
          {peopleOpts.map((p) => (
            <option key={p.id} value={p.id}>
              {getPersonFullName(p)} — {p.role}
            </option>
          ))}
        </select>
      </label>
      <MultiValueInput
        label="Puoi rivolgerti a noi per"
        values={state.contactFor}
        onChange={(v) => set("contactFor", v)}
      />
      <MultiValueInput
        label="Tags"
        values={state.tags}
        onChange={(v) => set("tags", v)}
      />
      <label className="block text-sm font-medium">
        Ordine
        <input
          type="number"
          className={inputClass}
          value={state.order}
          onChange={(e) => set("order", e.target.value)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.active}
          onChange={(e) => set("active", e.target.checked)}
        />
        Attivo
      </label>
      {message ? <p className="text-sm text-pcg-primary">{message}</p> : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded-pcg bg-pcg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Salvataggio…" : "Salva"}
      </button>
    </form>
  );
}
