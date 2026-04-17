export type TuneMap = {
  id: string;
  name: string;
  description: string;
  octane: 91 | 93 | "E85" | "Race";
  power: number; // estimated whp
  torque: number;
  revLimit: number;
  boostTarget: number;
  afrTarget: number;
  ignitionAdvance: number;
  active?: boolean;
  protected?: boolean;
  fuel: number[][]; // RPM x Load
  ignition: number[][];
};

export const RPM_AXIS = [800, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500];
export const LOAD_AXIS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const buildTable = (base: number, rpmFactor: number, loadFactor: number, jitter = 0.2) =>
  LOAD_AXIS.map((load, li) =>
    RPM_AXIS.map((rpm, ri) => {
      const v =
        base +
        (ri / RPM_AXIS.length) * rpmFactor +
        (li / LOAD_AXIS.length) * loadFactor +
        (Math.sin(ri * 0.7 + li * 0.4) * jitter);
      return Math.round(v * 100) / 100;
    })
  );

export const DEFAULT_MAPS: TuneMap[] = [
  {
    id: "stock",
    name: "OEM Stock",
    description: "Factory Nismo calibration. Untouched.",
    octane: 91,
    power: 350,
    torque: 276,
    revLimit: 7500,
    boostTarget: 0,
    afrTarget: 14.7,
    ignitionAdvance: 18,
    protected: true,
    fuel: buildTable(13.2, -1.5, -2.4),
    ignition: buildTable(20, 12, -8),
  },
  {
    id: "street93",
    name: "Street 93",
    description: "Aggressive bolt-on tune, premium pump gas.",
    octane: 93,
    power: 378,
    torque: 295,
    revLimit: 7600,
    boostTarget: 0,
    afrTarget: 13.2,
    ignitionAdvance: 22,
    active: true,
    fuel: buildTable(13.0, -1.2, -2.8),
    ignition: buildTable(22, 13, -9),
  },
  {
    id: "track",
    name: "Track Day",
    description: "Cooler AFRs, conservative timing for high IAT.",
    octane: 93,
    power: 372,
    torque: 290,
    revLimit: 7700,
    boostTarget: 0,
    afrTarget: 12.8,
    ignitionAdvance: 20,
    fuel: buildTable(12.6, -1.0, -3.0),
    ignition: buildTable(20, 11, -10),
  },
  {
    id: "e85",
    name: "E85 Flex",
    description: "Ethanol blend map. Big timing, rich AFRs.",
    octane: "E85",
    power: 405,
    torque: 312,
    revLimit: 7800,
    boostTarget: 0,
    afrTarget: 11.8,
    ignitionAdvance: 26,
    fuel: buildTable(11.6, -1.4, -3.2),
    ignition: buildTable(26, 14, -10),
  },
  {
    id: "valet",
    name: "Valet Mode",
    description: "Power limited to 180hp. 4500 rpm cut.",
    octane: 91,
    power: 180,
    torque: 160,
    revLimit: 4500,
    boostTarget: 0,
    afrTarget: 14.9,
    ignitionAdvance: 14,
    protected: true,
    fuel: buildTable(14.5, -0.5, -1.0),
    ignition: buildTable(14, 6, -4),
  },
];
