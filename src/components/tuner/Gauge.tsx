import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  redline?: number;
  warning?: number;
  size?: "sm" | "md" | "lg" | "responsive";
  accent?: "primary" | "accent" | "warning" | "success";
}

const SIZE_MAP = { sm: 60, md: 85, lg: 110 } as const;

export const Gauge = ({
  label,
  value,
  min,
  max,
  unit,
  redline,
  warning,
  size = "md",
  accent = "primary",
}: GaugeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [responsiveRadius, setResponsiveRadius] = useState(70);

  useEffect(() => {
    if (size !== "responsive") return;
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      // leave room for stroke (8) on each side
      const r = Math.max(46, Math.min(95, Math.floor(w / 2) - 10));
      setResponsiveRadius(r);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  const radius = size === "responsive" ? responsiveRadius : SIZE_MAP[size];
  const stroke = size === "lg" ? 12 : 8;
  const dim = (radius + stroke) * 2;
  const valueTextClass =
    size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : radius >= 80 ? "text-2xl" : radius >= 65 ? "text-xl" : "text-base";

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -135 + pct * 270;
  const circ = 2 * Math.PI * radius;
  const arcLen = (circ * 270) / 360;
  const filled = arcLen * pct;

  const inWarn = warning !== undefined && value >= warning;
  const inRed = redline !== undefined && value >= redline;
  const colorClass = inRed
    ? "text-destructive"
    : inWarn
    ? "text-warning"
    : accent === "accent"
    ? "text-accent"
    : accent === "success"
    ? "text-success"
    : "text-primary";

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = -135 + (i / 10) * 270;
    const rad = (a * Math.PI) / 180;
    const x1 = dim / 2 + Math.cos(rad) * (radius - stroke / 2 - 2);
    const y1 = dim / 2 + Math.sin(rad) * (radius - stroke / 2 - 2);
    const x2 = dim / 2 + Math.cos(rad) * (radius - stroke / 2 - 10);
    const y2 = dim / 2 + Math.sin(rad) * (radius - stroke / 2 - 10);
    return { x1, y1, x2, y2, major: i % 2 === 0 };
  });

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <div className="relative" style={{ width: dim, height: dim, maxWidth: "100%" }}>
        <svg width={dim} height={dim} className="-rotate-90">
          {/* Track */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circ}`}
            transform={`rotate(135 ${dim / 2} ${dim / 2})`}
          />
          {/* Filled */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            transform={`rotate(135 ${dim / 2} ${dim / 2})`}
            className={cn("transition-all duration-150", colorClass)}
            style={{ filter: `drop-shadow(0 0 6px hsl(var(--${inRed ? "destructive" : accent}) / 0.6))` }}
          />
        </svg>
        {/* Ticks */}
        <svg width={dim} height={dim} className="absolute inset-0 pointer-events-none">
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={t.major ? 1.5 : 0.5}
              opacity={t.major ? 0.7 : 0.3}
            />
          ))}
          {/* Needle */}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "center",
              transition: "transform 120ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <line
              x1={dim / 2}
              y1={dim / 2}
              x2={dim / 2 + radius - 14}
              y2={dim / 2}
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              className={colorClass}
            />
            <circle cx={dim / 2} cy={dim / 2} r={5} fill="hsl(var(--background))" stroke="currentColor" strokeWidth={2} className={colorClass} />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={cn("font-mono-tabular font-semibold leading-none", valueTextClass, colorClass)}>
            {value.toFixed(value >= 100 ? 0 : 1)}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{unit}</div>
        </div>
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{label}</div>
    </div>
  );
};
