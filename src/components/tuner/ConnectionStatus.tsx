import { useEffect, useState } from "react";
import { Activity, Wifi, WifiOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  connected: boolean;
  onToggle: () => void;
}

const handshakeSteps = [
  "Pinging ECU @ 500kbps",
  "ISO 14229 UDS handshake",
  "Reading VIN: JN1AZ4EH...",
  "ECU: HITACHI VQ37VHR",
  "Cal ID: 23710-9CV0A",
  "Live datastream OPEN",
];

export const ConnectionStatus = ({ connected, onToggle }: ConnectionStatusProps) => {
  const [step, setStep] = useState(-1);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!connected) {
      setStep(-1);
      return;
    }
    setConnecting(true);
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= handshakeSteps.length - 1) {
          clearInterval(id);
          setConnecting(false);
          return s;
        }
        return s + 1;
      });
    }, 320);
    return () => clearInterval(id);
  }, [connected]);

  return (
    <div className="panel p-4 relative overflow-hidden">
      {connecting && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-primary/20 overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-primary animate-sweep" />
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-md flex items-center justify-center border",
            connected ? "bg-success/10 border-success/40 text-success" : "bg-muted border-border text-muted-foreground"
          )}
        >
          {connected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("led", connected ? "text-success animate-pulse-glow" : "text-muted-foreground")}>•</span>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold">
              {connected ? (connecting ? "Handshaking" : "ECU Linked") : "Disconnected"}
            </span>
          </div>
          <div className="font-mono-tabular text-[11px] text-muted-foreground truncate">
            {connected
              ? step >= 0
                ? handshakeSteps[step]
                : "Initializing CAN bus..."
              : "Tap CONNECT to establish OBD-II link"}
          </div>
        </div>
        <Button
          variant={connected ? "outline" : "default"}
          size="sm"
          onClick={onToggle}
          className={cn(
            "font-semibold uppercase tracking-wider text-xs",
            !connected && "bg-gradient-primary hover:opacity-90 shadow-glow-soft"
          )}
        >
          {connected ? <Activity className="h-3.5 w-3.5 mr-1.5" /> : <Zap className="h-3.5 w-3.5 mr-1.5" />}
          {connected ? "Live" : "Connect"}
        </Button>
      </div>
    </div>
  );
};
