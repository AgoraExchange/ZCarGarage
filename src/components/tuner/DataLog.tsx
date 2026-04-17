import { useEffect, useRef, useState } from "react";
import { Telemetry } from "@/hooks/useEcuTelemetry";

interface DataLogProps {
  data: Telemetry;
  connected: boolean;
}

type Row = { t: string; rpm: number; thr: number; afr: number; tim: number; knk: number };

export const DataLog = ({ data, connected }: DataLogProps) => {
  const [rows, setRows] = useState<Row[]>([]);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!connected) return;
    const now = Date.now();
    if (now - lastRef.current < 250) return;
    lastRef.current = now;
    const t = new Date().toISOString().slice(11, 23);
    setRows((prev) => [{ t, rpm: data.rpm, thr: data.throttle, afr: data.afr, tim: data.timing, knk: data.knock }, ...prev].slice(0, 40));
  }, [data, connected]);

  return (
    <div className="panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Live Datalog</div>
        <div className="text-[10px] font-mono-tabular text-muted-foreground">{rows.length} samples · 4Hz</div>
      </div>
      <div className="flex-1 overflow-auto font-mono-tabular text-[11px] -mx-2">
        <table className="w-full">
          <thead className="text-muted-foreground sticky top-0 bg-card">
            <tr>
              <th className="text-left px-2 py-1 font-normal">TIME</th>
              <th className="text-right px-2 py-1 font-normal">RPM</th>
              <th className="text-right px-2 py-1 font-normal">THR%</th>
              <th className="text-right px-2 py-1 font-normal">AFR</th>
              <th className="text-right px-2 py-1 font-normal">TIM°</th>
              <th className="text-right px-2 py-1 font-normal">KNK</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">{connected ? "Capturing…" : "Connect ECU to start logging"}</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/30 hover:bg-surface-2">
                <td className="px-2 py-1 text-muted-foreground">{r.t}</td>
                <td className="px-2 py-1 text-right">{Math.round(r.rpm)}</td>
                <td className="px-2 py-1 text-right">{r.thr.toFixed(0)}</td>
                <td className={`px-2 py-1 text-right ${r.afr < 12 ? "text-accent" : r.afr > 14.7 ? "text-warning" : ""}`}>{r.afr.toFixed(2)}</td>
                <td className="px-2 py-1 text-right">{r.tim.toFixed(1)}</td>
                <td className={`px-2 py-1 text-right ${r.knk > 1 ? "text-destructive font-bold" : "text-muted-foreground"}`}>{r.knk.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
