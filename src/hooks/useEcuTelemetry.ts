import { useEffect, useRef, useState } from "react";

export type Telemetry = {
  rpm: number;
  speed: number; // mph
  throttle: number; // %
  boost: number; // psi (NA, but Nismo can have FI)
  afr: number; // air/fuel ratio
  coolant: number; // °F
  iat: number; // °F
  oilPress: number; // psi
  oilTemp: number; // °F
  voltage: number;
  knock: number; // 0-10
  gear: number;
  timing: number; // ° advance
  load: number; // %
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const IDLE: Telemetry = {
  rpm: 0,
  speed: 0,
  throttle: 0,
  boost: 0,
  afr: 14.7,
  coolant: 0,
  iat: 0,
  oilPress: 0,
  oilTemp: 0,
  voltage: 0,
  knock: 0,
  gear: 0,
  timing: 0,
  load: 0,
};

export function useEcuTelemetry(connected: boolean, aggression = 1, micLevel = 0, micActive = false) {
  const [data, setData] = useState<Telemetry>(IDLE);
  const tRef = useRef(0);
  const micRef = useRef(0);
  micRef.current = micLevel;

  useEffect(() => {
    if (!connected) {
      tRef.current = 0;
      setData(IDLE);
      return;
    }
    // Settle to running idle baseline once connected
    setData({
      rpm: 850,
      speed: 0,
      throttle: 0,
      boost: 0,
      afr: 14.7,
      coolant: 192,
      iat: 95,
      oilPress: 28,
      oilTemp: 198,
      voltage: 14.2,
      knock: 0,
      gear: 0,
      timing: 12,
      load: 8,
    });
    const id = setInterval(() => {
      tRef.current += 0.1;
      const t = tRef.current;
      const mic = micRef.current; // 0..1
      // When mic is active, throttle is driven by mic loudness instead of sim wave
      const wave = (Math.sin(t * 0.6) + 1) / 2; // 0..1
      const burst = Math.max(0, Math.sin(t * 1.4)) ** 2;
      const simThrottle = clamp(wave * 70 + burst * 30 * aggression, 0, 100);
      const micThrottle = clamp(mic * 110, 0, 100);
      const throttle = micActive ? micThrottle : simThrottle;
      const targetRpm = micActive
        ? 850 + mic * 6500 * aggression
        : 850 + throttle * 75 + burst * 1500 * aggression;
      const speed = clamp(throttle * 1.2 + Math.sin(t * 0.3) * 10, 0, 155);
      const gear = speed < 5 ? 0 : Math.min(6, Math.floor(speed / 25) + 1);

      setData((prev) => ({
        rpm: clamp(prev.rpm + (targetRpm - prev.rpm) * (micActive ? 0.45 : 0.25), 700, 7800),
        speed,
        throttle,
        boost: clamp(throttle / 14 + burst * 2 * aggression - 0.5, -10, 18),
        afr: clamp(14.7 - throttle * 0.04 + (Math.random() - 0.5) * 0.2, 10.5, 15.5),
        coolant: clamp(190 + throttle * 0.15 + Math.sin(t * 0.05) * 4, 170, 240),
        iat: clamp(90 + throttle * 0.25, 70, 180),
        oilPress: clamp(20 + (prev.rpm / 7500) * 60, 12, 90),
        oilTemp: clamp(195 + throttle * 0.2, 180, 270),
        voltage: clamp(14.1 + Math.sin(t * 0.4) * 0.3, 12, 14.8),
        knock: Math.max(0, (Math.random() - 0.96) * 12 * aggression),
        gear,
        timing: clamp(10 + throttle * 0.25, 8, 38),
        load: clamp(throttle * 0.95 + 5, 5, 100),
      }));
    }, 80);
    return () => clearInterval(id);
  }, [connected, aggression, micActive]);

  return data;
}
