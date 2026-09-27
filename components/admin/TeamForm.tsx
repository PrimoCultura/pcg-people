"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getConvexUserMessage } from "@/lib/convexErrors";
import { getPersonFullName } from "@/data/types";
import { mapConvexPerson, type ConvexPersonDoc } from "@/lib/mappers";

type TeamFormState = {
  name: string;
  slug: string;
  departmentId: string;
  headId: string;
  description: string;
  order: string;
  active: boolean;
};

const inputClass =
  "mt-1 h-10 w-full rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm outline-none focus:border-pcg-primary";

function slugifyClient(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function TeamForm({ teamId }: { teamId?: Id<"teams"> }) {
  const router = useRouter();
  const departments = useQuery(api.departments.listAll);
  const people = useQuery(api.people.listAll);
  const siblingTeams = useQuery(api.teams.listAll);
  const existing = useQuery(
    api.teams.getByIdAdmin,
    teamId ? { id: teamId } : "skip",
  );
  const create = useMutation(api.teams.create);
  const update = useMutation(api.teams.update);

  const [form, setForm] = useState<TeamFormState | null>(() =>
    teamId
      ? null
      : {
          name: "",
          slug: "",
          departmentId: "",
          headId: "",
          description: "",
          order: "",
          active: true,
        },
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(teamId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearMemberTeams, setClearMemberTeams] = useState(false);
  const [reassignMembersToTeamId, setReassignMembersToTeamId] = useState("");

  const state = useMemo(() => {
    if (form) return form;
    if (teamId) {
      if (!existing) return null;
      return {
        name: existing.name,
        slug: existing.slug,
        departmentId: existing.departmentId,
        headId: existing.headId ?? "",
        description: existing.description ?? "",
        order: existing.order?.toString() ?? "",
        active: existing.active,
      };
    }
    return {
      name: "",
      slug: "",
      departmentId: "",
      headId: "",
      description: "",
      order: "",
      active: true,
    };
  }, [form, teamId, existing]);

  if (teamId && existing === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }
  if (teamId && existing === null) {
    return <p className="text-sm text-pcg-text-secondary">Team non trovato.</p>;
  }
  if (!state || departments === undefined || people === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  const set = <K extends keyof TeamFormState>(
    key: K,
    value: TeamFormState[K],
  ) => {
    setForm({ ...state, [key]: value } as TeamFormState);
    setMessage(null);
    setError(null);
  };

  const peopleOpts = (people as ConvexPersonDoc[])
    .filter((p) => p.active)
    .map(mapConvexPerson);

  const selectedHead = peopleOpts.find((p) => p.id === state.headId);
  const crossDeptHead =
    selectedHead &&
    state.departmentId &&
    selectedHead.departmentId !== state.departmentId;

  const memberCount = existing?.activeMemberCount ?? 0;
  const deactivatingWithMembers =
    Boolean(teamId) &&
    Boolean(existing?.active) &&
    !state.active &&
    memberCount > 0;

  const reassignmentOptions = (siblingTeams ?? []).filter(
    (t) =>
      t._id !== teamId &&
      t.active &&
      t.departmentId === (existing?.departmentId ?? state.departmentId),
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;

    if (deactivatingWithMembers) {
      if (!clearMemberTeams && !reassignMembersToTeamId) {
        setError(
          "Il Team ha membri attivi. Conferma la rimozione dal Team oppure scegli un Team di destinazione.",
        );
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: state.name.trim(),
        departmentId: state.departmentId as Id<"departments">,
        headId: state.headId ? (state.headId as Id<"people">) : undefined,
        description: state.description.trim() || undefined,
        order: state.order ? Number(state.order) : undefined,
        active: teamId ? state.active : (state.active ?? true),
      };

      if (teamId) {
        await update({
          id: teamId,
          ...payload,
          slug: state.slug.trim() || slugifyClient(state.name),
          active: state.active,
          clearMemberTeams: deactivatingWithMembers
            ? clearMemberTeams || undefined
            : undefined,
          reassignMembersToTeamId:
            deactivatingWithMembers && reassignMembersToTeamId
              ? (reassignMembersToTeamId as Id<"teams">)
              : undefined,
        });
        setMessage("Team salvato");
      } else {
        const id = await create({
          ...payload,
          slug: state.slug.trim() || undefined,
        });
        setMessage("Team creato");
        router.push(`/admin/team/${id}`);
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
        {teamId ? "Modifica Team" : "Nuovo Team"}
      </h2>

      <label className="block text-sm font-medium">
        Nome
        <input
          required
          className={inputClass}
          value={state.name}
          onChange={(e) => {
            const name = e.target.value;
            if (!slugTouched) {
              setForm({
                ...state,
                name,
                slug: slugifyClient(name),
              });
            } else {
              set("name", name);
            }
            setMessage(null);
            setError(null);
          }}
        />
      </label>

      <label className="block text-sm font-medium">
        Slug
        <input
          className={inputClass}
          value={state.slug}
          onChange={(e) => {
            setSlugTouched(true);
            set("slug", e.target.value);
          }}
        />
        <span className="mt-1 block text-xs text-pcg-text-muted">
          Unico all&apos;interno del dipartimento. Generato automaticamente dal
          nome.
        </span>
      </label>

      <label className="block text-sm font-medium">
        Dipartimento
        <select
          required
          className={inputClass}
          value={state.departmentId}
          onChange={(e) => set("departmentId", e.target.value)}
        >
          <option value="">Seleziona…</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium">
        Responsabile del Team
        <select
          className={inputClass}
          value={state.headId}
          onChange={(e) => set("headId", e.target.value)}
        >
          <option value="">Nessuno</option>
          {peopleOpts.map((p) => (
            <option key={p.id} value={p.id}>
              {getPersonFullName(p)} — {p.role}
              {p.departmentLabel ? ` (${p.departmentLabel})` : ""}
            </option>
          ))}
        </select>
      </label>

      {crossDeptHead ? (
        <p
          className="rounded-pcg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="status"
        >
          Il responsabile scelto appartiene a un altro dipartimento (
          {selectedHead?.departmentLabel}). È consentito per responsabilità
          trasversali: la sua anagrafica non verrà modificata.
        </p>
      ) : null}

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
        Ordine di visualizzazione
        <input
          type="number"
          className={inputClass}
          value={state.order}
          onChange={(e) => set("order", e.target.value)}
          placeholder="Assegnato automaticamente se vuoto"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.active}
          onChange={(e) => {
            set("active", e.target.checked);
            if (e.target.checked) {
              setClearMemberTeams(false);
              setReassignMembersToTeamId("");
            }
          }}
        />
        Attivo
      </label>

      {deactivatingWithMembers ? (
        <div className="space-y-3 rounded-pcg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-950">
            Questo Team ha <strong>{memberCount}</strong>{" "}
            {memberCount === 1 ? "membro attivo" : "membri attivi"}. Per
            disattivarlo, gestisci le assegnazioni:
          </p>
          <label className="flex items-start gap-2 text-sm text-amber-950">
            <input
              type="radio"
              name="deactivate-members"
              checked={clearMemberTeams && !reassignMembersToTeamId}
              onChange={() => {
                setClearMemberTeams(true);
                setReassignMembersToTeamId("");
              }}
              className="mt-0.5"
            />
            Rimuovi i membri dal Team (restano nel dipartimento senza Team)
          </label>
          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm text-amber-950">
              <input
                type="radio"
                name="deactivate-members"
                checked={Boolean(reassignMembersToTeamId)}
                onChange={() => {
                  setClearMemberTeams(false);
                  if (!reassignMembersToTeamId && reassignmentOptions[0]) {
                    setReassignMembersToTeamId(reassignmentOptions[0]._id);
                  }
                }}
                className="mt-0.5"
                disabled={reassignmentOptions.length === 0}
              />
              Riassegna a un altro Team dello stesso dipartimento
            </label>
            {reassignmentOptions.length > 0 ? (
              <select
                className={inputClass}
                value={reassignMembersToTeamId}
                onChange={(e) => {
                  setReassignMembersToTeamId(e.target.value);
                  setClearMemberTeams(false);
                }}
              >
                <option value="">Seleziona Team…</option>
                {reassignmentOptions.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="pl-6 text-xs text-amber-800">
                Nessun altro Team attivo nel dipartimento.
              </p>
            )}
          </div>
        </div>
      ) : null}

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
