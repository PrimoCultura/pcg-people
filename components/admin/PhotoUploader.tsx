"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import type { Person } from "@/data/types";
import { getConvexUserMessage } from "@/lib/convexErrors";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type PhotoUploaderProps = {
  personId: Id<"people">;
  person: Pick<Person, "firstName" | "lastName" | "photoUrl">;
  onDone?: () => void;
};

export function PhotoUploader({
  personId,
  person,
  onDone,
}: PhotoUploaderProps) {
  const generateUploadUrl = useMutation(api.people.generateUploadUrl);
  const setPhoto = useMutation(api.people.setPhoto);
  const clearPhoto = useMutation(api.people.clearPhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = preview ?? person.photoUrl ?? null;

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMessage(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Formato non supportato. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("La foto supera i 2 MB. Riduci le dimensioni e riprova.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) {
        throw new Error("Upload fallito");
      }
      const { storageId } = (await result.json()) as {
        storageId: Id<"_storage">;
      };
      await setPhoto({ id: personId, storageId });
      setMessage("Foto aggiornata");
      onDone?.();
    } catch (err) {
      setError(getConvexUserMessage(err, "Impossibile caricare la foto."));
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    setBusy(true);
    setError(null);
    try {
      await clearPhoto({ id: personId });
      setPreview(null);
      setMessage("Foto rimossa");
      onDone?.();
    } catch (err) {
      setError(getConvexUserMessage(err, "Impossibile rimuovere la foto."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-pcg border border-pcg-border bg-pcg-bg p-4">
      <p className="text-sm font-medium text-pcg-ink">Foto profilo</p>
      <div className="mt-3 flex items-center gap-4">
        <PersonAvatar
          person={{
            firstName: person.firstName,
            lastName: person.lastName,
            photoUrl: displayUrl,
          }}
          size="lg"
        />
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-pcg bg-pcg-primary px-3 py-2 text-sm font-medium text-white hover:bg-pcg-primary-hover disabled:opacity-60"
          >
            {busy ? "Caricamento…" : "Carica foto"}
          </button>
          {person.photoUrl || preview ? (
            <button
              type="button"
              disabled={busy}
              onClick={removePhoto}
              className="ml-2 text-sm text-pcg-text-muted hover:text-pcg-primary"
            >
              Rimuovi
            </button>
          ) : null}
          <p className="text-xs text-pcg-text-muted">JPG, PNG o WEBP · max 2 MB</p>
        </div>
      </div>
      {message ? (
        <p className="mt-2 text-sm text-pcg-primary">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
