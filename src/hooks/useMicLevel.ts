import { useEffect, useRef, useState } from "react";

export type MicState = {
  enabled: boolean;
  level: number; // 0..1 normalized loudness
  db: number; // approx dBFS (-100..0)
  error: string | null;
};

export function useMicLevel(enabled: boolean) {
  const [state, setState] = useState<MicState>({ enabled: false, level: 0, db: -100, error: null });
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const stop = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close().catch(() => {});
      }
      ctxRef.current = null;
      analyserRef.current = null;
      setState({ enabled: false, level: 0, db: -100, error: null });
    };

    if (!enabled) {
      stop();
      return;
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
        const ctx = new Ctx();
        ctxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.6;
        src.connect(analyser);
        analyserRef.current = analyser;

        const buf = new Float32Array(analyser.fftSize);
        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          const rms = Math.sqrt(sum / buf.length);
          const db = 20 * Math.log10(rms || 1e-7);
          // Map -60..-10 dB to 0..1
          const level = Math.max(0, Math.min(1, (db + 60) / 50));
          setState({ enabled: true, level, db, error: null });
          rafRef.current = requestAnimationFrame(tick);
        };
        setState({ enabled: true, level: 0, db: -100, error: null });
        tick();
      } catch (e: any) {
        setState({ enabled: false, level: 0, db: -100, error: e?.message || "Microphone permission denied" });
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled]);

  return state;
}
