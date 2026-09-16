type ClinicListProps = {
  clinics: { id: string; name: string; city?: string }[];
  showCity?: boolean;
};

export function ClinicList({ clinics, showCity = false }: ClinicListProps) {
  if (clinics.length === 0) return null;

  return (
    <ul className="mt-3 space-y-1.5">
      {clinics.map((clinic) => (
        <li key={clinic.id} className="text-sm text-pcg-text-secondary">
          {clinic.name}
          {showCity && clinic.city ? (
            <span className="text-pcg-text-muted"> · {clinic.city}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
