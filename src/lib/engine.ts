/**
 * PROPRIETARY AND CONFIDENTIAL: CASCADE-APEX CORE
 * VERSION: 2.1.0-STABLE
 * PRE-PRODUCTION RELEASE
 */

export const UnitState = {
  STABLE: 'STABLE',
  STRESSED: 'STRESSED',
  COLLAPSED: 'COLLAPSED'
} as const;

export type UnitState = (typeof UnitState)[keyof typeof UnitState];

export interface Unit {
  id: string;
  position: [number, number, number];
  resilience: number;   // phi
  stress: number;       // sigma
  state: UnitState;

  modelOfSelf: {
    perceivedMorale: number;
    isDetected: boolean;
  };
}

export interface SystemState {
  units: Unit[];
  connections: [string, string][];
  globalTransmissionFactor: number; // tau
  decayRate?: number;            // gamma
  collapseSharpness?: number;    // k
  lastPulseIntensity?: number;
}

type AdjacencyMap = Map<string, { id: string; weight: number }[]>;

const _clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));
const _sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/**
 * CASCADE CORE: Stochastic Contagion Logic
 */
export class CascadeEngine {
  private adj: AdjacencyMap;
  private idx: Map<string, Unit>;
  private state: SystemState;

  constructor(state: SystemState) {
    this.state = state;
    this.idx = new Map(state.units.map(u => [u.id, u]));
    this.adj = this._build(state.connections);
  }

  private _build(cons: [string, string][]): AdjacencyMap {
    const map: AdjacencyMap = new Map();
    for (const [u1, u2] of cons) {
      if (!map.has(u1)) map.set(u1, []);
      if (!map.has(u2)) map.set(u2, []);
      map.get(u1)!.push({ id: u2, weight: 1.0 });
      map.get(u2)!.push({ id: u1, weight: 1.0 });
    }
    return map;
  }

  static calculateContagion(state: SystemState): SystemState {
    return new CascadeEngine(state).step();
  }

  step(rng = Math.random): SystemState {
    const tau = this.state.globalTransmissionFactor;
    const gamma = this.state.decayRate ?? 0.05;
    const k = this.state.collapseSharpness ?? 10;

    const updated = this.state.units.map(u => {
      if (u.state === UnitState.COLLAPSED) return { ...u };

      const nb = this.adj.get(u.id) ?? [];
      const dw = nb.reduce((a, n) => a + n.weight, 0) || 1;

      // propagate weighted neighbor collapse factor
      const flux = nb.reduce((sum, n) => {
        const neighbor = this.idx.get(n.id);
        return neighbor?.state === UnitState.COLLAPSED ? sum + n.weight : sum;
      }, 0) / dw;

      const nextSigma = _clamp((1 - gamma) * u.stress + tau * flux);
      const prob = _sigmoid(k * (nextSigma - u.resilience));

      const isTerminal = prob > rng();

      return {
        ...u,
        stress: nextSigma,
        state: isTerminal ? UnitState.COLLAPSED :
          nextSigma > u.resilience * 0.5 ? UnitState.STRESSED : UnitState.STABLE
      };
    });

    return { ...this.state, units: updated };
  }
}

/**
 * APEX LAYER: Threshold exploitation & signal masking
 */
export class ApexEngine {
  static optimizePulse(
    unit: Unit,
    nbFlux = 0,
    tau = 0.15,
    eps = 0.01
  ): number {
    const req = unit.resilience - (unit.stress + tau * nbFlux);
    return Math.max(0, req + eps);
  }

  static generateDeception(sigma: number, delta = 0.7, alpha = 8): number {
    if (sigma <= delta) return sigma;
    const range = 1 - delta;
    const comp = Math.log(1 + alpha * (sigma - delta)) / Math.log(1 + alpha * range);
    return _clamp(delta + comp * range);
  }
}

/**
 * INTEL SUB-ENG: External event ingestion
 */
export interface NewsEvent {
  id: string;
  timestamp: number;
  source: string;
  headline: string;
  impactNodeId: string;
  stressImpact: number;
  persistence: number;
}

export class IntelligenceEngine {
  static simulateNews(): NewsEvent {
    const sources = ['REUTERS', 'BLOOMBERG', 'WSJ', 'AP', 'AL JAZEERA', 'NIKKEI'];
    const headlines = [
      'Supply chain bottleneck: Logistics alert issued',
      'Advanced chip demand hits record highs',
      'Cyber-sec breach at assembly node',
      'Trade tensions ignite energy price concerns',
      'Regulatory audit impacts autonomous segments',
      'Logistics strike: International shipping delays',
      'Manufacturing zone hit by weather anomaly',
      'Lithography breakthrough announced',
      'Logistics network signal spikes detected'
    ];
    const nodes = ['TSMC-FAB-18', 'ASML-LITHO', 'NVIDIA-CORP', 'APPLE-GLOBAL', 'AWS-CLOUDS', 'FOXCONN-ASSEMBLY'];

    return {
      id: Math.random().toString(36).slice(7),
      timestamp: Date.now(),
      source: sources[Math.floor(Math.random() * sources.length)],
      headline: headlines[Math.floor(Math.random() * headlines.length)],
      impactNodeId: nodes[Math.floor(Math.random() * nodes.length)],
      stressImpact: 0.05 + Math.random() * 0.15,
      persistence: 1.0
    };
  }

  static injectEvent(
    state: SystemState,
    event: NewsEvent
  ): SystemState {
    const updated = state.units.map(u => {
      if (u.id !== event.impactNodeId) return u;
      return {
        ...u,
        stress: _clamp(u.stress + event.stressImpact * event.persistence)
      };
    });
    return { ...state, units: updated };
  }
}
