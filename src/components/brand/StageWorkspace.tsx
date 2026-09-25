import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { runStage } from "@/lib/brandmind.functions";
import {
  FIELD_LABELS,
  STAGES,
  STAGE_MAP,
  completionPercent,
  nextStage,
  type BrandDna,
  type StageId,
} from "@/lib/stages";

import { DnaPanel } from "./DnaPanel";
import { DnaValue } from "./DnaValue";
import { StageChips } from "./StageChips";

export type WorkspaceState = {
  title: string;
  idea: string;
  meta: Record<string, string>;
  dna: BrandDna;
  completed: string[];
  runs: { stage: string; output: Record<string, unknown>; inherited?: string[] }[];
};

function buildBrandBook(state: WorkspaceState) {
  const lines: string[] = [
    `# ${String(state.dna["selectedName"] ?? state.title)} — Brand Book`,
    "",
    `> ${String(state.dna["revisedTagline"] ?? state.dna["tagline"] ?? "")}`,
    "",
    "## The rough idea",
    state.idea,
    "",
  ];
  for (const stage of STAGES) {
    if (!stage.ai || !state.completed.includes(stage.id)) continue;
    lines.push(`## ${stage.short} ${stage.label}`, `_${stage.purpose}_`, "");
    for (const field of stage.produces) {
      const value = state.dna[field];
      if (value === undefined) continue;
      lines.push(`### ${FIELD_LABELS[field] ?? field}`);
      lines.push(typeof value === "object" ? "```json\n" + JSON.stringify(value, null, 2) + "\n```" : String(value));
      lines.push("");
    }
  }
  return lines.join("\n");
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function StageWorkspace({
  state,
  onStageComplete,
  demo = false,
}: {
  state: WorkspaceState;
  onStageComplete: (stage: StageId, output: Record<string, unknown>, inherited: string[]) => void;
  demo?: boolean;
}) {
  const execute = useServerFn(runStage);
  const [current, setCurrent] = useState<StageId>(nextStage(state.completed));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const stage = STAGE_MAP[current];
  const percent = completionPercent(state.completed);
  const lastRun = useMemo(
    () => [...state.runs].reverse().find((r) => r.stage === current),
    [state.runs, current],
  );
  const inheritedNow = stage.inherits.filter((f) => f in state.dna);
  const blocked = stage.inherits.length > 0 && inheritedNow.length === 0;

  async function handleRun() {
    setBusy(true);
    try {
      const result = await execute({
        data: { stage: current, idea: state.idea, meta: state.meta, dna: state.dna, note: note || undefined },
      });
      onStageComplete(current, result.output, result.inherited);
      setNote("");
      toast.success(`${stage.label} complete`, { description: "The Brand DNA has been updated." });
      const following = STAGES[STAGES.findIndex((s) => s.id === current) + 1];
      if (following) setCurrent(following.id);
    } catch (error) {
      toast.error("That stage didn't finish", {
        description: error instanceof Error ? error.message : "Please try running it again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="label-mono flex items-center gap-2 text-foreground/50">
            <span className="size-1.5 rounded-full bg-cool" />
            Current stage · {stage.label}
          </div>
          <div className="font-mono text-[11px] text-foreground/40">
            {state.completed.filter((c) => c !== "export").length}/9 stages · {percent}%
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-foreground/[0.03] p-4">
          <div className="label-mono text-foreground/40">Rough idea</div>
          <div className="mt-1 text-[15px] text-foreground/85">“{state.idea}”</div>
        </div>

        <div className="mt-5">
          <StageChips completed={state.completed} current={current} onSelect={setCurrent} />
        </div>

        <div className="mt-5 rounded-xl border border-border bg-foreground/[0.03] p-5">
          <div className="label-mono text-cool">
            {stage.short} · {stage.label}
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground/70">{stage.purpose}</p>

          {stage.ai ? (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-ink/60 p-3">
                  <div className="label-mono text-foreground/40">Reads from earlier stages</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {stage.inherits.length === 0 ? (
                      <span className="text-[12px] text-foreground/50">Nothing — this is the first stage.</span>
                    ) : (
                      stage.inherits.map((f) => (
                        <span
                          key={f}
                          className={`rounded-md px-2 py-1 text-[12px] ${
                            f in state.dna
                              ? "bg-cool/15 text-cool"
                              : "border border-border text-foreground/40"
                          }`}
                        >
                          {FIELD_LABELS[f] ?? f}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-ink/60 p-3">
                  <div className="label-mono text-foreground/40">Adds to the Brand DNA</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {stage.produces.map((f) => (
                      <span
                        key={f}
                        className="rounded-md bg-primary/15 px-2 py-1 text-[12px] text-primary"
                      >
                        {FIELD_LABELS[f] ?? f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Optional steer for this stage — e.g. “keep it calmer”, “we sell in India first”."
                className="mt-4 w-full resize-none rounded-lg border border-border bg-ink/60 p-3 text-[13px] text-foreground placeholder:text-foreground/35 focus:border-primary/60 focus:outline-none"
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRun}
                  disabled={busy || blocked}
                  className="rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground shadow-[0_0_40px_-8px_var(--primary)] transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                  {busy
                    ? `Running ${stage.label}…`
                    : state.completed.includes(stage.id)
                      ? `Re-run ${stage.label}`
                      : `Run ${stage.label}`}
                </button>
                {blocked ? (
                  <span className="text-[12px] text-warm">Run the earlier stages first — this one needs their output.</span>
                ) : null}
              </div>
            </>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => download("brand-book.md", buildBrandBook(state), "text/markdown")}
                className="rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Download brand book
              </button>
              <button
                onClick={() =>
                  download("brand-dna.json", JSON.stringify({ ...state, runs: undefined }, null, 2), "application/json")
                }
                className="rounded-xl border border-border bg-foreground/5 px-5 py-3 text-[14px] font-medium text-foreground/80 transition-colors hover:bg-foreground/10"
              >
                Download Brand DNA (JSON)
              </button>
            </div>
          )}
        </div>

        {lastRun ? (
          <div className="mt-5 rounded-xl border border-cool/25 bg-cool/[0.05] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="label-mono text-cool">{stage.label} output</div>
              {lastRun.inherited?.length ? (
                <span className="font-mono text-[10px] text-foreground/45">
                  built on {lastRun.inherited.length} inherited fields
                </span>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {Object.entries(lastRun.output).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-border bg-ink/60 p-4">
                  <div className="label-mono text-foreground/40">{FIELD_LABELS[key] ?? key}</div>
                  <div className="mt-2">
                    <DnaValue value={value} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5">
          <DnaPanel dna={state.dna} highlight={inheritedNow} />
        </div>
      </div>

      <aside className="panel h-max p-5">
        <div className="label-mono text-cool">Brand DNA · always on</div>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-ink/60 p-3">
            <div className="label-mono text-foreground/40">Brand</div>
            <div className="mt-1 font-display text-2xl uppercase tracking-tight">
              {String(state.dna["selectedName"] ?? state.title)}
            </div>
            <div className="mt-1 text-[13px] text-foreground/55">
              {String(state.dna["revisedTagline"] ?? state.dna["tagline"] ?? "Tagline appears after Name")}
            </div>
          </div>

          <div>
            <div className="label-mono text-foreground/40">Palette</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(() => {
                const dir = state.dna["colorDirection"] as
                  | { palette?: { hex?: string; name?: string }[] }
                  | undefined;
                const palette = dir?.palette ?? [];
                if (!palette.length) {
                  return <span className="text-[12px] text-foreground/40">Set during Visualize.</span>;
                }
                return palette.map((c, i) => (
                  <span
                    key={i}
                    title={`${c.name ?? ""} ${c.hex ?? ""}`}
                    className="size-9 rounded-lg outline-1 -outline-offset-1 outline-foreground/15"
                    style={{ backgroundColor: c.hex ?? "transparent" }}
                  />
                ));
              })()}
            </div>
          </div>

          <div>
            <div className="label-mono text-foreground/40">Personality</div>
            <div className="mt-2">
              <DnaValue value={state.dna["brandPersonality"]} />
            </div>
          </div>

          <div>
            <div className="label-mono text-foreground/40">Consistency</div>
            <div className="mt-1 font-display text-2xl text-cool">
              {state.dna["consistencyScore"] !== undefined ? `${String(state.dna["consistencyScore"])}%` : "—"}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-foreground/[0.03] p-3 text-[12px] leading-snug text-foreground/60">
            Every stage reads this panel. Nothing is invented twice — later stages build on these fields instead of
            starting from your original sentence.
          </div>

          {demo ? (
            <div className="rounded-lg border border-warm/30 bg-warm/10 p-3 text-[12px] leading-snug text-foreground/75">
              Demo mode. This brand lives in this browser only — create an account to keep it.
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
