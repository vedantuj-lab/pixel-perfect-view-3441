const HEX = /^#[0-9a-fA-F]{3,8}$/;

function Primitive({ value }: { value: string | number | boolean }) {
  const text = String(value);
  if (HEX.test(text)) {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          className="size-4 rounded outline-1 -outline-offset-1 outline-foreground/20"
          style={{ backgroundColor: text }}
        />
        <span className="font-mono text-[12px] text-foreground/70">{text}</span>
      </span>
    );
  }
  return <span className="text-[13px] leading-snug text-foreground/85">{text}</span>;
}

export function DnaValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-[13px] text-foreground/35">—</span>;
  }

  if (Array.isArray(value)) {
    const primitives = value.every((v) => typeof v !== "object" || v === null);
    if (primitives) {
      return (
        <span className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <span
              key={i}
              className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-[12px] text-foreground/75"
            >
              {String(v)}
            </span>
          ))}
        </span>
      );
    }
    return (
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="rounded-lg border border-border bg-ink/60 p-3">
            <DnaValue value={v} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-1.5">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex flex-wrap items-baseline gap-2">
            <span className="label-mono min-w-24 text-foreground/40">{k}</span>
            <span className="flex-1 min-w-40">
              <DnaValue value={v} depth={depth + 1} />
            </span>
          </div>
        ))}
      </div>
    );
  }

  return <Primitive value={value as string} />;
}
