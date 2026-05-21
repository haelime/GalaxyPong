type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function Field({ label, type = "text", value, onChange, required }: FieldProps) {
  return (
    <label className="block text-sm font-semibold text-white/75">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-white outline-none transition focus:border-neon focus:shadow-neon"
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
