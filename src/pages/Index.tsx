import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Gauge as GaugeIcon, Settings, FileCog, Activity, FlaskConical, Download, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useMicLevel } from "@/hooks/useMicLevel";
import engineHero from "@/assets/engine-hero.jpg";
import { ConnectionStatus } from "@/components/tuner/ConnectionStatus";
import { Gauge } from "@/components/tuner/Gauge";
import { RpmBar } from "@/components/tuner/RpmBar";
import { MapCard } from "@/components/tuner/MapCard";
import { MapEditor } from "@/components/tuner/MapEditor";
import { DataLog } from "@/components/tuner/DataLog";
import { Diagnostics } from "@/components/tuner/Diagnostics";
import { useEcuTelemetry } from "@/hooks/useEcuTelemetry";
import { DEFAULT_MAPS, TuneMap } from "@/data/maps";

const Index = () => {
  const [connected, setConnected] = useState(false);
  const [maps, setMaps] = useState<TuneMap[]>(DEFAULT_MAPS);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_MAPS.find((m) => m.active)!.id);
  const [editorTable, setEditorTable] = useState<"fuel" | "ignition">("fuel");
  const [micEnabled, setMicEnabled] = useState(false);

  const selected = useMemo(() => maps.find((m) => m.id === selectedId)!, [maps, selectedId]);
  const active = useMemo(() => maps.find((m) => m.active)!, [maps]);

  const mic = useMicLevel(micEnabled);
  const data = useEcuTelemetry(
    connected,
    active.octane === "E85" ? 1.3 : active.id === "valet" ? 0.4 : active.id === "drift" ? 1.2 : 1,
    mic.level,
    mic.enabled && connected
  );

  const toggleMic = () => {
    if (!connected) {
      toast.error("Connect to ECU first", { description: "Mic-driven throttle needs a live ECU link." });
      return;
    }
    if (micEnabled) {
      setMicEnabled(false);
      toast.info("Mic input disabled");
    } else {
      setMicEnabled(true);
      toast.success("Mic armed", { description: "Rev your engine — loudness drives throttle & RPM." });
    }
  };

  const activate = (id: string) => {
    setMaps((prev) => prev.map((m) => ({ ...m, active: m.id === id })));
    const m = maps.find((x) => x.id === id)!;
    toast.success(`Flashed: ${m.name}`, { description: `${m.power} whp · ${m.afrTarget} AFR · ${m.ignitionAdvance}° timing` });
  };

  const updateTable = (next: number[][]) => {
    setMaps((prev) => prev.map((m) => (m.id === selectedId ? { ...m, [editorTable]: next } : m)));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="h-7 w-7 shrink-0 rounded bg-gradient-primary flex items-center justify-center font-black text-primary-foreground text-sm shadow-glow-soft">
              Z
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-bold text-sm tracking-tight truncate">NISMO Tuner OS</div>
              <div className="text-[10px] text-muted-foreground font-mono-tabular truncate">370Z · VQ37VHR · v2.4.1</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 ml-6 text-[11px] font-mono-tabular text-muted-foreground">
            <div><span className="text-muted-foreground/60">VIN</span> <span className="text-foreground">JN1AZ4EH7DM430812</span></div>
            <div><span className="text-muted-foreground/60">CAL</span> <span className="text-foreground">23710-9CV0A</span></div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono-tabular min-w-0">
            <span className="text-muted-foreground hidden xs:inline">Active:</span>
            <span className="px-1.5 sm:px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-semibold truncate max-w-[110px] sm:max-w-none">{active.name}</span>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Log
          </Button>
          <Button variant="outline" size="icon" className="sm:hidden h-8 w-8 shrink-0" aria-label="Export log">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={mic.enabled ? "default" : "outline"}
            size="icon"
            onClick={toggleMic}
            aria-label={mic.enabled ? "Disable microphone rev input" : "Enable microphone rev input"}
            aria-pressed={mic.enabled}
            className={cn(
              "h-8 w-8 shrink-0 relative",
              mic.enabled && "bg-gradient-primary text-primary-foreground shadow-glow-soft"
            )}
          >
            {mic.enabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            {mic.enabled && (
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse-glow"
                style={{ transform: `scale(${0.6 + mic.level * 1.4})` }}
              />
            )}
          </Button>
        </div>
      </header>

      {/* Hero strip */}
      <div className="relative h-32 md:h-44 overflow-hidden border-b border-border">
        <img src={engineHero} alt="370Z Nismo VQ37VHR engine bay" className="absolute inset-0 w-full h-full object-cover opacity-50" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-[1600px] mx-auto px-4 lg:px-6 h-full flex items-end pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold mb-1">Tuning Cockpit</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Real-time control. <span className="text-muted-foreground font-light">Surgical precision.</span></h1>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
        <ConnectionStatus connected={connected} onToggle={() => setConnected((c) => !c)} />

        <Tabs defaultValue="dash" className="w-full">
          <div className="-mx-3 sm:mx-0 overflow-x-auto scrollbar-none">
            <TabsList className="bg-surface-1 border border-border h-10 p-1 inline-flex w-max min-w-full mx-3 sm:mx-0">
              <TabsTrigger value="dash" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground gap-1.5 px-2.5 sm:px-3">
                <GaugeIcon className="h-3.5 w-3.5" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="maps" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground gap-1.5 px-2.5 sm:px-3">
                <FileCog className="h-3.5 w-3.5" /> Maps
              </TabsTrigger>
              <TabsTrigger value="editor" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground gap-1.5 px-2.5 sm:px-3">
                <FlaskConical className="h-3.5 w-3.5" /> Tables
              </TabsTrigger>
              <TabsTrigger value="log" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground gap-1.5 px-2.5 sm:px-3">
                <Activity className="h-3.5 w-3.5" /> Logs
              </TabsTrigger>
              <TabsTrigger value="diag" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground gap-1.5 px-2.5 sm:px-3">
                <Settings className="h-3.5 w-3.5" /> Diag
              </TabsTrigger>
            </TabsList>
          </div>

          {/* DASHBOARD */}
          <TabsContent value="dash" className="space-y-4 mt-4">
            <RpmBar rpm={data.rpm} redline={active.revLimit} shiftLight={active.revLimit - 400} />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 panel p-3 sm:p-5">
              <Gauge label="Speed" value={data.speed} min={0} max={180} unit="MPH" size="responsive" />
              <Gauge label="Throttle" value={data.throttle} min={0} max={100} unit="%" accent="accent" size="responsive" />
              <Gauge label="AFR" value={data.afr} min={10} max={16} unit="A/F" warning={15} accent="accent" size="responsive" />
              <Gauge label="Coolant" value={data.coolant} min={140} max={250} unit="°F" warning={220} redline={235} size="responsive" />
              <Gauge label="Oil Pressure" value={data.oilPress} min={0} max={100} unit="PSI" accent="success" size="responsive" />
              <Gauge label="Battery" value={data.voltage} min={11} max={15} unit="V" accent="success" size="responsive" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: "IAT", v: `${data.iat.toFixed(0)}°F`, sub: "Intake Air" },
                { l: "Oil Temp", v: `${data.oilTemp.toFixed(0)}°F`, sub: data.oilTemp > 250 ? "HIGH" : "Normal" },
                { l: "Timing", v: `${data.timing.toFixed(1)}°`, sub: "BTDC" },
                { l: "Knock", v: data.knock.toFixed(1), sub: data.knock > 1 ? "RETARD ACTIVE" : "Clean", danger: data.knock > 1 },
                { l: "Engine Load", v: `${data.load.toFixed(0)}%`, sub: "Calculated" },
                { l: "Gear", v: data.gear === 0 ? "N" : data.gear, sub: "6MT" },
                { l: "Boost / Vac", v: `${data.boost > 0 ? "+" : ""}${data.boost.toFixed(1)}`, sub: "PSI" },
                { l: "Map", v: active.name, sub: `${active.octane} oct` },
              ].map((s, i) => (
                <div key={i} className="panel p-3">
                  <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{s.l}</div>
                  <div className={`font-mono-tabular text-xl font-bold mt-1 ${(s as any).danger ? "text-destructive" : ""}`}>{s.v}</div>
                  <div className={`text-[10px] ${(s as any).danger ? "text-destructive" : "text-muted-foreground"}`}>{s.sub}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* MAPS */}
          <TabsContent value="maps" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold tracking-tight">Saved Maps</h2>
                <p className="text-xs text-muted-foreground">Tap a map to inspect, then activate to flash to ECU.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.info("Use the Tables tab to clone & edit", { description: "Pro tip: hold a base map and tweak from there." })}>
                + New Map
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {maps.map((m) => (
                <MapCard key={m.id} map={m} selected={selectedId === m.id} onSelect={() => setSelectedId(m.id)} onActivate={() => activate(m.id)} />
              ))}
            </div>
          </TabsContent>

          {/* EDITOR */}
          <TabsContent value="editor" className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Editing</div>
                <div className="font-bold text-lg">{selected.name}</div>
              </div>
              <div className="flex items-center gap-1 panel p-1">
                <Button size="sm" variant={editorTable === "fuel" ? "default" : "ghost"} onClick={() => setEditorTable("fuel")} className={editorTable === "fuel" ? "bg-gradient-primary" : ""}>
                  Fuel (AFR)
                </Button>
                <Button size="sm" variant={editorTable === "ignition" ? "default" : "ghost"} onClick={() => setEditorTable("ignition")} className={editorTable === "ignition" ? "bg-gradient-primary" : ""}>
                  Ignition
                </Button>
              </div>
            </div>
            <MapEditor map={selected} table={editorTable} onChange={updateTable} />
          </TabsContent>

          {/* LOG */}
          <TabsContent value="log" className="mt-4 grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-[420px] sm:h-[520px]">
              <DataLog data={data} connected={connected} />
            </div>
            <div className="space-y-3">
              <div className="panel p-4">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Session</div>
                <div className="font-mono-tabular text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Peak RPM</span><span>{Math.round(data.rpm).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Peak Boost</span><span>{data.boost.toFixed(1)} psi</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Min AFR</span><span className="text-accent">{data.afr.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Max IAT</span><span>{data.iat.toFixed(0)}°F</span></div>
                </div>
              </div>
              <Diagnostics connected={connected} />
            </div>
          </TabsContent>

          <TabsContent value="diag" className="mt-4 grid md:grid-cols-2 gap-4">
            <Diagnostics connected={connected} />
            <div className="panel p-4">
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">ECU Identity</div>
              <dl className="font-mono-tabular text-xs space-y-1.5">
                {[
                  ["Hardware", "HITACHI 23710-9CV0A"],
                  ["Software", "VQ37VHR-NISMO-R2"],
                  ["Bootloader", "v1.08"],
                  ["Tuner", "OPEN ECU · Stage 2"],
                  ["Last flash", new Date().toISOString().slice(0, 16).replace("T", " ")],
                  ["Engine hours", "1,247.6"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border/30 pb-1">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </TabsContent>
        </Tabs>

        <footer className="text-center text-[10px] text-muted-foreground font-mono-tabular pt-4 pb-6">
          NISMO TUNER OS · For off-road use only · Always datalog before & after changes
        </footer>
      </main>
    </div>
  );
};

export default Index;
