"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
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
  city: string;
  region: string;
  address: string;
  districtId: string;
  areaManagerId: string;
  order: string;
  active: boolean;
};

export function ClinicForm({ clinicId }: { clinicId?: Id<"clinics"> }) {
  const router = useRouter();
  const people = useQuery(api.people.listAll);
  const districts = useQuery(api.districts.listAll);
  const existing = useQuery(
    api.clinics.getByIdAdmin,
    clinicId ? { id: clinicId } : "skip",
  );
  const create = useMutation(api.clinics.create);
  const update = useMutation(api.clinics.update);
  const [form, setForm] = useState<FormState | null>(() =>
    clinicId
      ? null
      : {
          name: "",
          slug: "",
          city: "",
          region: "",
          address: "",
          districtId: "",
          areaManagerId: "",
          order: "",
          active: true,
        },
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const state = useMemo(() => {
    if (form) return form;
    if (clinicId) {
      if (!existing) return null;
      return {
        name: existing.name,
        slug: existing.slug,
        city: existing.city,
        region: existing.region ?? "",
        address: existing.address ?? "",
        districtId: existing.districtId,
        areaManagerId: existing.areaManagerId,
        order: existing.order?.toString() ?? "",
        active: existing.active,
      };
    }
    return {
      name: "",
      slug: "",
      city: "",
      region: "",
      address: "",
      districtId: "",
      areaManagerId: "",
      order: "",
      active: true,
    };
  }, [form, clinicId, existing]);

  if (clinicId && existing === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }
  if (!state || people === undefined || districts === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm({ ...state, [key]: value });
    setMessage(null);
    setError(null);
  };

  const activeDistricts = districts.filter((d) => d.active);
  const districtOptions =
    activeDistricts.length > 0 ? activeDistricts : districts;

  const allAreaManagers = (people as ConvexPersonDoc[])
    .filter((p) => p.active && p.networkRole === "area-manager")
    .map(mapConvexPerson);

  const amOptions = allAreaManagers.filter(
    (p) => !state.districtId || p.districtId === state.districtId,
  );

  const amWithoutDistrict = allAreaManagers.filter((p) => !p.districtId);
  const amInOtherDistricts = state.districtId
    ? allAreaManagers.filter(
        (p) => p.districtId && p.districtId !== state.districtId,
      )
    : [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;
    setSaving(true);
    setError(null);
    try {
      const base = {
        name: state.name.trim(),
        city: state.city.trim(),
        region: state.region.trim() || undefined,
        address: state.address.trim() || undefined,
        districtId: state.districtId as Id<"districts">,
        areaManagerId: state.areaManagerId as Id<"people">,
        order: state.order ? Number(state.order) : undefined,
        active: clinicId ? state.active : (state.active ?? true),
      };
      if (clinicId) {
        await update({
          id: clinicId,
          ...base,
          slug: state.slug.trim(),
          active: state.active,
        });
        setMessage("Clinica salvata");
      } else {
        const id = await create({
          ...base,
          slug: state.slug.trim() || undefined,
        });
        router.push(`/admin/cliniche/${id}`);
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
        {clinicId ? "Modifica clinica" : "Nuova clinica"}
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
        Città
        <input
          required
          className={inputClass}
          value={state.city}
          onChange={(e) => set("city", e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Regione
        <input
          className={inputClass}
          value={state.region}
          onChange={(e) => set("region", e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Indirizzo
        <input
          className={inputClass}
          value={state.address}
          onChange={(e) => set("address", e.target.value)}
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
        Distretto
        <select
          required
          className={inputClass}
          value={state.districtId}
          onChange={(e) => {
            setForm({
              ...state,
              districtId: e.target.value,
              areaManagerId: "",
            });
            setMessage(null);
            setError(null);
          }}
        >
          <option value="">Seleziona…</option>
          {districtOptions.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
              {!d.active ? " (disattivo)" : ""}
            </option>
          ))}
        </select>
      </label>
      {districtOptions.length === 0 ? (
        <p
          className="rounded-pcg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="status"
        >
          Nessun distretto in anagrafica. I Team «District Manager» in Sales non
          bastano: crea i distretti in{" "}
          <Link href="/admin/distretti/nuovo" className="underline">
            Admin → Distretti
          </Link>
          . Serve prima una persona con Network role «district-manager».
        </p>
      ) : null}

      <label className="block text-sm font-medium">
        Area Manager
        <select
          required
          className={inputClass}
          value={state.areaManagerId}
          onChange={(e) => set("areaManagerId", e.target.value)}
          disabled={!state.districtId && amOptions.length === 0}
        >
          <option value="">Seleziona…</option>
          {amOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {getPersonFullName(p)} — {p.role}
              {p.districtLabel ? ` (${p.districtLabel})` : ""}
            </option>
          ))}
        </select>
      </label>
      {state.districtId && amOptions.length === 0 ? (
        <p
          className="rounded-pcg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="status"
        >
          Nessun Area Manager per questo distretto.
          {allAreaManagers.length === 0
            ? " Nelle anagrafiche nessuno ha Network role «area-manager» (il titolo di ruolo non basta)."
            : null}
          {amWithoutDistrict.length > 0
            ? ` ${amWithoutDistrict.length} Area Manager senza distretto assegnato: impostalo nella scheda persona.`
            : null}
          {amInOtherDistricts.length > 0
            ? ` ${amInOtherDistricts.length} Area Manager sono collegati ad altri distretti.`
            : null}{" "}
          Apri la persona in Admin → Persone, imposta Network role =
          area-manager e il Distretto corretto.
        </p>
      ) : null}
      {!state.districtId && allAreaManagers.length === 0 ? (
        <p className="text-xs text-pcg-text-muted">
          Per vedere gli Area Manager: nelle anagrafiche imposta Network role =
          «area-manager» e il Distretto (anche se il tipo persona resta HQ).
        </p>
      ) : null}
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
