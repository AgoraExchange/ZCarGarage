import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

const codes = [
  { code: "P0011", desc: "Intake Camshaft Position Timing - Bank 1", severity: "stored" as const },
  { code: "P0420", desc: "Catalyst Efficiency Below Threshold", severity: "pending" as const },
];

export const Diagnostics = ({ connected }: { connected: boolean }) => {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Diagnostics · DTC</div>
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
      </div>
      {!connected ? (
        <div className="text-xs text-muted-foreground py-6 text-center">ECU offline</div>
      ) : (
        <div className="space-y-2">
          {codes.map((c) => (
            <div key={c.code} className="flex items-start gap-3 p-2.5 rounded bg-surface-2 border border-border">
              <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${c.severity === "pending" ? "text-warning" : "text-destructive"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-tabular text-sm font-bold">{c.code}</span>
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{c.severity}</span>
                </div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-success pt-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Readiness monitors: 11/11 complete
          </div>
        </div>
      )}
    </div>
  );
};
