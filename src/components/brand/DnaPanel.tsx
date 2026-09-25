import { FIELD_LABELS, STAGES, type BrandDna } from "@/lib/stages";

import { DnaValue } from "./DnaValue";

/** Which stage produced each field — this is the lineage judges can read. */
function producerOf(field: string): string | undefined {
  return STAGES.find((s) => s.produces.includes(field))?.label;
}

export function DnaPanel({
  dna,
  highlight = [],
  title = "Persistent Brand DNA",
}: {
  dna: BrandDna;
  highlight?: string[];
  title?: string;
}) {
  const entries = Object.entries(dna).filter(([, v]) => v !== null && v !== undefined && v !== "");

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="label-mono text-primary">{title}</div>
        <span className="rounded-md bg-cool/15 px-2 py-0.5 font-mono text-[10px] text-cool">
          {entries.length} fields · synced
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="mt-4 text-[13px] text-foreground/50">
          Empty for now. The first stage writes the founding fields, and every later stage reads them.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className={`rounded-lg border p-4 ${
                highlight.includes(key)
                  ? "border-cool/45 bg-cool/[0.08]"
                  : "border-border bg-ink/60"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="label-mono text-foreground/40">{FIELD_LABELS[key] ?? key}</div>
                {producerOf(key) ? (
                  <div className="font-mono text-[10px] text-primary/80">from {producerOf(key)}</div>
                ) : null}
              </div>
              <div className="mt-2">
                <DnaValue value={value} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
