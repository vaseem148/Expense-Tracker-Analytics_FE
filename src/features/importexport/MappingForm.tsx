import { Label, Select } from '@/components/ui/Field';

export interface Preview {
  headers: string[];
  rows: Record<string, string>[];
  suggestedMapping: Record<string, string | null>;
}

const FIELDS = ['date', 'description', 'amount', 'debit', 'credit', 'category', 'merchant'];

/**
 * Column mapping plus a live sample. Bank exports vary enough that guessing
 * silently is worse than showing the guess and letting someone correct it.
 */
export function MappingForm({
  preview,
  mapping,
  onChange,
}: {
  preview: Preview;
  mapping: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  return (
    <>
      <div>
        <p className="mb-2 text-[12.5px] font-medium text-[var(--ink-2)]">Column mapping</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field}>
              <Label>{field}</Label>
              <Select
                value={mapping[field] ?? ''}
                onChange={(e) => onChange({ ...mapping, [field]: e.target.value })}
              >
                <option value="">not mapped</option>
                {preview.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] text-[var(--ink-muted)]">
          Bank statements usually carry separate debit and credit columns; a single signed amount
          column works too.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
        <table className="w-full border-collapse text-left text-[12px]">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              {preview.headers.map((h) => (
                <th key={h} className="px-3 py-2 font-medium text-[var(--ink-muted)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((r, i) => (
              <tr key={i} className="border-t border-[var(--line)]">
                {preview.headers.map((h) => (
                  <td key={h} className="px-3 py-1.5 text-[var(--ink-2)]">
                    {r[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
