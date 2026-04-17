import { TuneMap } from "@/data/maps";
import { cn } from "@/lib/utils";
import { Lock, Check, Fuel, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapCardProps {
  map: TuneMap;
  selected: boolean;
  onSelect: () => void;
  onActivate: () => void;
}

export const MapCard = ({ map, selected, onSelect, onActivate }: MapCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "panel text-left p-4 w-full transition-all relative overflow-hidden group",
        selected ? "border-primary shadow-glow-soft" : "hover:border-primary/40"
      )}
    >
      {map.active && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] uppercase tracking-widest text-success font-semibold">
          <span className="led text-success animate-pulse-glow">•</span> Active
        </div>
      )}
      {map.protected && !map.active && (
        <Lock className="absolute top-3 right-3 h-3.5 w-3.5 text-muted-foreground" />
      )}

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-surface-3 text-accent">
          {map.octane}{typeof map.octane === "number" ? " OCT" : ""}
        </span>
        <h3 className="font-bold text-base tracking-tight">{map.name}</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-snug mb-3 line-clamp-2">{map.description}</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="font-mono-tabular text-lg font-bold text-primary">{map.power}</div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">whp</div>
        </div>
        <div>
          <div className="font-mono-tabular text-lg font-bold">{map.torque}</div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">lb-ft</div>
        </div>
        <div>
          <div className="font-mono-tabular text-lg font-bold text-accent">{(map.revLimit / 1000).toFixed(1)}k</div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">limit</div>
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-border text-[10px] font-mono-tabular text-muted-foreground">
        <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {map.afrTarget} AFR</span>
        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {map.ignitionAdvance}°</span>
      </div>

      {selected && !map.active && (
        <Button
          size="sm"
          className="w-full mt-3 bg-gradient-primary"
          onClick={(e) => {
            e.stopPropagation();
            onActivate();
          }}
        >
          <Check className="h-3 w-3 mr-1" /> Activate Map
        </Button>
      )}
    </button>
  );
};
