import { cn } from "@/lib/utils";

interface RpmBarProps {
  rpm: number;
  redline: number;
  shiftLight?: number;
}

export const RpmBar = ({ rpm, redline, shiftLight }: RpmBarProps) => {
  const max = redline + 200;
  const segments = 40;
  const filled = Math.round((rpm / max) * segments);
  const shiftSeg = shiftLight ? Math.round((shiftLight / max) * segments) : segments;
  const redSeg = Math.round((redline / max) * segments);

  return (
    <div className="panel p-3 sm:p-4">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground shrink-0">Engine Speed</div>
        <div className="font-mono-tabular text-2xl sm:text-3xl font-bold text-glow truncate">
          {Math.round(rpm).toLocaleString()}
          <span className="text-[10px] sm:text-xs text-muted-foreground ml-1.5 sm:ml-2 font-normal">RPM</span>
        </div>
      </div>
      <div className="flex gap-[2px] sm:gap-[3px] h-5 sm:h-6">
        {Array.from({ length: segments }).map((_, i) => {
          const isRed = i >= redSeg;
          const isShift = i >= shiftSeg;
          const lit = i < filled;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-sm transition-all duration-75",
                lit
                  ? isShift
                    ? "bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
                    : isRed
                    ? "bg-warning"
                    : "bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.6)]"
                  : "bg-surface-3"
              )}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[9px] font-mono-tabular text-muted-foreground">
        <span>0</span>
        <span>2k</span>
        <span>4k</span>
        <span>6k</span>
        <span className="text-destructive">{(redline / 1000).toFixed(1)}k</span>
      </div>
    </div>
  );
};
