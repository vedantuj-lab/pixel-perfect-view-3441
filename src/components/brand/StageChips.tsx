import { STAGES, type StageId } from "@/lib/stages";

export function StageChips({
  completed,
  current,
  onSelect,
}: {
  completed: string[];
  current: StageId;
  onSelect?: (stage: StageId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {STAGES.map((stage) => {
        const done = completed.includes(stage.id);
        const active = stage.id === current;
        const className = active
          ? "border-primary/50 bg-primary/15 text-primary"
          : done
            ? "border-cool/40 bg-cool/10 text-cool"
            : "border-border bg-foreground/5 text-foreground/50";
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onSelect?.(stage.id)}
            className={`rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${className}`}
          >
            {stage.label}
            {active ? " ●" : done ? " ✓" : ""}
          </button>
        );
      })}
    </div>
  );
}
