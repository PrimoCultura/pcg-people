"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getConvexUserMessage } from "@/lib/convexErrors";
import { getPersonFullName } from "@/data/types";
import { mapConvexPerson, type ConvexPersonDoc } from "@/lib/mappers";

const inputClass =
  "mt-1 h-10 w-full rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm outline-none focus:border-pcg-primary";

type FormState = {
  name: string;
  slug: string;
  shortName: string;
  managerId: string;
  description: string;
  order: string;
  active: boolean;
};

export function DistrictForm({
  districtId,
}: {
  districtId?: Id<"districts">;
}) {
  const router = useRouter();
  const people = useQuery(api.people.listAll);
  const existing = useQuery(
    api.districts.getByIdAdmin,
    districtId ? { id: districtId } : "skip",
  );
  const create = useMutation(api.districts.create);
  const update = useMutation(api.districts.update);
  const [form, setForm] = useState<FormState | null>(() =>
    districtId
      ? null
      : {
          name: "",
          slug: "",
          shortName: "",
          managerId: "",
          description: "",
          order: "",
          active: true,
        },
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const state = useMemo(() => {
    if (form) return form;
    if (districtId) {
      if (!existing) return null;
      return {
        name: existing.name,
        slug: existing.slug,
        shortName: existing.shortName ?? "",
        managerId: existing.managerId,
        description: existing.description ?? "",
        order: existing.order?.toString() ?? "",
        active: existing.active,
      };
    }
    return {
      name: "",
      slug: "",
      shortName: "",
      managerId: "",
      description: "",
      order: "",
      active: true,
    };
  }, [form, districtId, existing]);

  if (districtId && existing === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }
  if (!state || people === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm({ ...state, [key]: value });
    setMessage(null);
    setError(null);
  };

  const dmOptions = (people as ConvexPersonDoc[])
    .filter((p) => p.active && p.networkRole === "district-manager")
    .map(mapConvexPerson);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;
    setSaving(true);
    setError(null);
    try {
      const base = {
        name: state.name.trim(),
        shortName: state.shortName.trim() || undefined,
        managerId: state.managerId as Id<"people">,
        description: state.description.trim() || undefined,
        order: state.order ? Number(state.order) : undefined,
        active: districtId ? state.active : (state.active ?? true),
      };
      if (districtId) {
        await update({
          id: districtId,
          ...base,
          slug: state.slug.trim(),
          active: state.active,
        });
        setMessage("Distretto salvato");
      } else {
        const id = await create({
          ...base,
          slug: state.slug.trim() || undefined,
        });
        router.push(`/admin/distretti/${id}`);
      }
    } catch (err) {
      setError(getConvexUserMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-pcg-ink">
        {districtId ? "Modifica distretto" : "Nuovo distretto"}
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
        Short name
        <input
          className={inputClass}
          value={state.shortName}
          onChange={(e) => set("shortName", e.target.value)}
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
        District Manager
        <select
          required
          className={inputClass}
          value={state.managerId}
          onChange={(e) => set("managerId", e.target.value)}
        >
          <option value="">Seleziona…</option>
          {dmOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {getPersonFullName(p)} — {p.role}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Descrizione
        <textarea
          rows={3}
          className={inputClass}
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
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
