import { useState } from "react";
import { LOAD_AXIS, RPM_AXIS, TuneMap } from "@/data/maps";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface MapEditorProps {
  map: TuneMap;
  table: "fuel" | "ignition";
  onChange: (next: number[][]) => void;
}

const heat = (v: number, min: number, max: number) => {
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
  // 0 -> cool blue, 0.5 -> green, 1 -> red
  const hue = 220 - t * 220;
  return `hsl(${hue} 75% ${20 + t * 25}%)`;
};

export const MapEditor = ({ map, table, onChange }: MapEditorProps) => {
  const data = table === "fuel" ? map.fuel : map.ignition;
  const flat = data.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const [sel, setSel] = useState<{ r: number; c: number } | null>({ r: 5, c: 7 });
  const [original] = useState(data);

  const adjust = (delta: number) => {
    if (!sel) return;
    if (map.protected) {
      toast.error("This map is protected. Clone it to edit.");
      return;
    }
    const next = data.map((row) => row.slice());
    next[sel.r][sel.c] = Math.round((next[sel.r][sel.c] + delta) * 100) / 100;
    onChange(next);
  };

  const reset = () => {
    onChange(original);
    toast.success("Table reset to last save");
  };

  const save = () => {
    toast.success(`${table === "fuel" ? "Fuel" : "Ignition"} table flashed to ECU`, {
      description: `Cells modified · checksum OK`,
    });
  };

  const unit = table === "fuel" ? "AFR" : "° BTDC";

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {table === "fuel" ? "Fuel Table" : "Ignition Table"} · RPM × Load%
          </div>
          <div className="font-mono-tabular text-sm">
            {sel ? (
              <>
                <span className="text-primary">{RPM_AXIS[sel.c]} rpm</span>
                <span className="text-muted-foreground mx-2">/</span>
                <span className="text-accent">{LOAD_AXIS[sel.r]}% load</span>
                <span className="text-muted-foreground mx-2">→</span>
                <span className="font-bold">{data[sel.r][sel.c].toFixed(2)} {unit}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select a cell</span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => adjust(-0.1)} disabled={!sel}>
            <Minus className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => adjust(0.1)} disabled={!sel}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={save} className="bg-gradient-primary">
            <Save className="h-3 w-3 mr-1" /> Flash
          </Button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-separate border-spacing-[2px] text-[10px] font-mono-tabular">
          <thead>
            <tr>
              <th className="text-muted-foreground text-right pr-2">Load\RPM</th>
              {RPM_AXIS.map((rpm) => (
                <th key={rpm} className="text-muted-foreground font-normal text-center min-w-[42px]">
                  {rpm >= 1000 ? `${(rpm / 1000).toFixed(1)}k` : rpm}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, r) => (
              <tr key={r}>
                <td className="text-muted-foreground text-right pr-2">{LOAD_AXIS[r]}%</td>
                {row.map((v, c) => {
                  const selected = sel?.r === r && sel?.c === c;
                  return (
                    <td
                      key={c}
                      onClick={() => setSel({ r, c })}
                      className={cn(
                        "text-center py-1.5 px-1 rounded cursor-pointer transition-all border border-transparent",
                        selected && "border-primary scale-110 z-10 relative shadow-glow-soft"
                      )}
                      style={{ background: heat(v, min, max) }}
                    >
                      <span className="text-foreground/95 font-medium">{v.toFixed(1)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground font-mono-tabular">
        <span>{min.toFixed(2)}</span>
        <div
          className="flex-1 h-2 rounded"
          style={{ background: "linear-gradient(to right, hsl(220 75% 25%), hsl(120 75% 35%), hsl(0 75% 45%))" }}
        />
        <span>{max.toFixed(2)} {unit}</span>
      </div>
    </div>
  );
};
