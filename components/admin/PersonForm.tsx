"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MultiValueInput } from "@/components/admin/MultiValueInput";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { getConvexUserMessage } from "@/lib/convexErrors";
import {
  mapConvexPerson,
  type ConvexPersonDoc,
} from "@/lib/mappers";
import { getPersonFullName } from "@/data/types";
import type { NetworkRole, PersonArea } from "@/data/types";

type PersonFormProps = {
  personId?: Id<"people">;
};

type FormState = {
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string;
  managerId: string;
  type: PersonArea;
  networkRole: "" | NetworkRole;
  districtId: string;
  email: string;
  phone: string;
  location: string;
  shortDescription: string;
  responsibilities: string[];
  tags: string[];
  active: boolean;
  isOrgRoot: boolean;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  role: "",
  departmentId: "",
  managerId: "",
  type: "hq",
  networkRole: "",
  districtId: "",
  email: "",
  phone: "",
  location: "",
  shortDescription: "",
  responsibilities: [],
  tags: [],
  active: true,
  isOrgRoot: false,
};

export function PersonForm({ personId }: PersonFormProps) {
  const router = useRouter();
  const departments = useQuery(api.departments.listAll);
  const districts = useQuery(api.districts.listAll);
  const people = useQuery(api.people.listAll);
  const existing = useQuery(
    api.people.getByIdAdmin,
    personId ? { id: personId } : "skip",
  );
  const createPerson = useMutation(api.people.create);
  const updatePerson = useMutation(api.people.update);
  const setActive = useMutation(api.people.setActive);

  const [form, setForm] = useState<FormState | null>(() =>
    personId ? null : { ...emptyForm, active: true },
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialized = useMemo(() => {
    if (form) return form;
    if (personId) {
      if (!existing) return null;
      const doc = existing as ConvexPersonDoc;
      return {
        firstName: doc.firstName,
        lastName: doc.lastName,
        role: doc.role,
        departmentId: doc.departmentId,
        managerId: doc.managerId ?? "",
        type: doc.type,
        networkRole: doc.networkRole ?? "",
        districtId: doc.districtId ?? "",
        email: doc.email,
        phone: doc.phone ?? "",
        location: doc.location ?? "",
        shortDescription: doc.shortDescription ?? "",
        responsibilities: doc.responsibilities,
        tags: doc.tags,
        active: doc.active,
        isOrgRoot: Boolean(doc.isOrgRoot),
      } satisfies FormState;
    }
    return { ...emptyForm, active: true };
  }, [form, personId, existing]);

  const state = form ?? initialized;

  const managerOptions = useMemo(() => {
    if (!people) return [];
    return (people as ConvexPersonDoc[])
      .filter((p) => p.active && (!personId || p._id !== personId))
      .map((p) => mapConvexPerson(p));
  }, [people, personId]);

  if (personId && existing === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }
  if (personId && existing === null) {
    return <p className="text-sm text-pcg-text-secondary">Persona non trovata.</p>;
  }
  if (!state || departments === undefined || people === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm({ ...state, [key]: value });
    setMessage(null);
    setError(null);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        firstName: state.firstName.trim(),
        lastName: state.lastName.trim(),
        role: state.role.trim(),
        departmentId: state.departmentId as Id<"departments">,
        managerId: state.managerId
          ? (state.managerId as Id<"people">)
          : undefined,
        type: state.type,
        networkRole: state.networkRole || undefined,
        districtId: state.districtId
          ? (state.districtId as Id<"districts">)
          : undefined,
        email: state.email.trim(),
        phone: state.phone.trim() || undefined,
        location: state.location.trim() || undefined,
        shortDescription: state.shortDescription.trim() || undefined,
        responsibilities: state.responsibilities,
        tags: state.tags,
        active: personId ? state.active : (state.active ?? true),
        isOrgRoot: state.isOrgRoot || undefined,
      };

      if (personId) {
        await updatePerson({ id: personId, ...payload, active: state.active });
        setMessage("Persona salvata");
      } else {
        const id = await createPerson(payload);
        setMessage("Persona creata");
        router.push(`/admin/persone/${id}`);
      }
    } catch (err) {
      setError(getConvexUserMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    if (!personId || !state) return;
    setSaving(true);
    setError(null);
    try {
      await setActive({ id: personId, active: !state.active });
      set("active", !state.active);
      setMessage(state.active ? "Persona disattivata" : "Persona riattivata");
    } catch (err) {
      setError(getConvexUserMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const mappedExisting = existing
    ? mapConvexPerson(existing as ConvexPersonDoc)
    : null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-pcg-ink">
          {personId ? "Modifica persona" : "Nuova persona"}
        </h2>
        {personId ? (
          <button
            type="button"
            onClick={toggleActive}
            disabled={saving}
            className="text-sm font-medium text-pcg-primary hover:underline disabled:opacity-60"
          >
            {state.active ? "Disattiva" : "Riattiva"}
          </button>
        ) : null}
      </div>

      {personId && mappedExisting ? (
        <PhotoUploader
          personId={personId}
          person={mappedExisting}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <input
            required
            value={state.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Cognome">
          <input
            required
            value={state.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Ruolo">
          <input
            required
            value={state.role}
            onChange={(e) => set("role", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Tipo">
          <select
            value={state.type}
            onChange={(e) => set("type", e.target.value as PersonArea)}
            className={inputClass}
          >
            <option value="hq">HQ</option>
            <option value="network">Network</option>
          </select>
        </Field>
        <Field label="Dipartimento">
          <select
            required
            value={state.departmentId}
            onChange={(e) => set("departmentId", e.target.value)}
            className={inputClass}
          >
            <option value="">Seleziona…</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Responsabile diretto">
          <select
            value={state.managerId}
            onChange={(e) => set("managerId", e.target.value)}
            className={inputClass}
          >
            <option value="">Nessuno</option>
            {managerOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {getPersonFullName(p)} — {p.role}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={state.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Telefono">
          <input
            value={state.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Sede / location">
          <input
            value={state.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {state.type === "network" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Network role">
            <select
              value={state.networkRole}
              onChange={(e) =>
                set("networkRole", e.target.value as FormState["networkRole"])
              }
              className={inputClass}
            >
              <option value="">—</option>
              <option value="head">head</option>
              <option value="district-manager">district-manager</option>
              <option value="area-manager">area-manager</option>
            </select>
          </Field>
          {(state.networkRole === "district-manager" ||
            state.networkRole === "area-manager") && (
            <Field label="Distretto">
              <select
                value={state.districtId}
                onChange={(e) => set("districtId", e.target.value)}
                className={inputClass}
              >
                <option value="">Seleziona…</option>
                {(districts ?? []).map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      ) : null}

      <Field label="Descrizione breve">
        <textarea
          value={state.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          rows={3}
          className={inputClass}
        />
      </Field>

      <MultiValueInput
        label="Puoi rivolgerti a me per"
        values={state.responsibilities}
        onChange={(values) => set("responsibilities", values)}
      />
      <MultiValueInput
        label="Tags"
        values={state.tags}
        onChange={(values) => set("tags", values)}
      />

      <label className="flex items-center gap-2 text-sm text-pcg-text">
        <input
          type="checkbox"
          checked={state.active}
          onChange={(e) => set("active", e.target.checked)}
        />
        Attivo
      </label>
      <div>
        <label className="flex items-center gap-2 text-sm text-pcg-text">
          <input
            type="checkbox"
            checked={state.isOrgRoot}
            onChange={(e) => set("isOrgRoot", e.target.checked)}
          />
          Vertice dell’organigramma
        </label>
        <p className="mt-1 text-xs text-pcg-text-muted">
          Seleziona solo per la persona da cui parte la struttura gerarchica.
          Tutte le altre persone devono avere un responsabile diretto.
        </p>
      </div>

      {message ? (
        <p className="text-sm text-pcg-primary" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-pcg bg-pcg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-pcg-primary-hover disabled:opacity-60"
      >
        {saving ? "Salvataggio…" : "Salva"}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1 h-10 w-full rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm outline-none focus:border-pcg-primary";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-pcg-ink">
      {label}
      {children}
    </label>
  );
}
