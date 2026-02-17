import { useState, useEffect } from 'react';
import { NetworkGraph } from './components/NetworkGraph';
import type { Unit, SystemState, NewsEvent } from './lib/engine';
import { UnitState, CascadeEngine, ApexEngine, IntelligenceEngine } from './lib/engine';
import { Shield, Target, Zap, Activity, AlertTriangle, Terminal as TerminalIcon, Globe, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_UNITS: Unit[] = [
  { id: 'TSMC-FAB-18', position: [-2, 0, 0], resilience: 0.95, stress: 0.45, state: UnitState.STABLE, modelOfSelf: { perceivedMorale: 0.98, isDetected: false } },
  { id: 'ASML-LITHO', position: [-4, 2, -1], resilience: 0.85, stress: 0.2, state: UnitState.STABLE, modelOfSelf: { perceivedMorale: 0.95, isDetected: false } },
  { id: 'NVIDIA-CORP', position: [0, 0, 0], resilience: 0.65, stress: 0.35, state: UnitState.STABLE, modelOfSelf: { perceivedMorale: 0.90, isDetected: false } },
  { id: 'APPLE-GLOBAL', position: [2, -1, 2], resilience: 0.75, stress: 0.25, state: UnitState.STABLE, modelOfSelf: { perceivedMorale: 0.96, isDetected: false } },
  { id: 'AWS-CLOUDS', position: [3, 2, -1], resilience: 0.70, stress: 0.15, state: UnitState.STABLE, modelOfSelf: { perceivedMorale: 0.98, isDetected: false } },
  { id: 'FOXCONN-ASSEMBLY', position: [0, -3, 1], resilience: 0.55, stress: 0.5, state: UnitState.STABLE, modelOfSelf: { perceivedMorale: 0.65, isDetected: false } },
];

const INITIAL_CONNECTIONS: [string, string][] = [
  ['ASML-LITHO', 'TSMC-FAB-18'],
  ['TSMC-FAB-18', 'NVIDIA-CORP'],
  ['NVIDIA-CORP', 'APPLE-GLOBAL'],
  ['NVIDIA-CORP', 'AWS-CLOUDS'],
  ['TSMC-FAB-18', 'FOXCONN-ASSEMBLY'],
  ['FOXCONN-ASSEMBLY', 'APPLE-GLOBAL'],
];

function App() {
  const [state, setState] = useState<SystemState>({
    units: INITIAL_UNITS,
    connections: INITIAL_CONNECTIONS,
    globalTransmissionFactor: 0.15,
    lastPulseIntensity: 0
  });

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(['[SYS_READY] APEX_KERNEL LOADED. VERSION 2.1.0-STABLE.']);
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const event = IntelligenceEngine.simulateNews();
      setNews(prev => [event, ...prev.slice(0, 4)]);

      setState(prev => {
        const u_new = prev.units.map(u => {
          if (u.id === event.impactNodeId) {
            const s_new = Math.min(1, u.stress + event.stressImpact);
            const state_new = s_new > u.resilience ? UnitState.COLLAPSED : s_new > u.resilience * 0.5 ? UnitState.STRESSED : UnitState.STABLE;
            return { ...u, stress: s_new, state: state_new };
          }
          return u;
        });
        return { ...prev, units: u_new };
      });

      setLogs(prev => [`[INTEL] ${event.source}: ${event.headline.toUpperCase()}`, ...prev.slice(0, 19)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const selectedUnit = state.units.find(u => u.id === selectedUnitId);

  const log = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString('en-GB')}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const onPropagate = () => {
    setState(prev => CascadeEngine.calculateContagion(prev));
    log('CASCADE_SIGNAL: BROADCASTING CONTAGION VECTOR.');
  };

  const onPulse = (id: string) => {
    setState(prev => {
      const u_upd = prev.units.map(u => {
        if (u.id === id) {
          const pulse = ApexEngine.optimizePulse(u);
          const s_upd = Math.min(1, u.stress + pulse);
          log(`APEX_CORE: TARGETING ${id}. PULSE_INTENSITY: ${pulse.toFixed(4)}`);
          return {
            ...u,
            stress: s_upd,
            state: s_upd >= u.resilience ? UnitState.COLLAPSED : UnitState.STRESSED
          };
        }
        return u;
      });
      return { ...prev, units: u_upd };
    });
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <div className="scanner-line" />

      <AnimatePresence>
        {isBooting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              style={{ width: 40, height: 40, border: '2px solid var(--brand-brahmastra)', borderTopColor: 'transparent', borderRadius: '50%' }}
            />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--brand-brahmastra)', letterSpacing: '0.3em' }}>APEX_OS v2.1.0 BOOTING...</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="app-container" style={{ display: 'grid', gridTemplateColumns: '380px 1fr 380px', height: '100vh', gap: '1px', background: 'var(--border-subtle)' }}>

        <aside className="glass" style={{ margin: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'hidden' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <Activity size={20} color="var(--brand-yugma)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brand-yugma)', letterSpacing: '0.15em' }}>CASCADE_CORE</h2>
          </header>

          <section style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={12} color="var(--brand-yugma)" />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Signal Ingestion</span>
            </div>
            <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <AnimatePresence>
                {news.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ padding: '0.75rem', background: 'rgba(0,255,202,0.03)', borderRadius: '4px', border: '1px solid rgba(0,255,202,0.1)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--brand-yugma)', fontWeight: 900 }}>{item.source}</span>
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', opacity: 0.5 }}>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 500 }}>{item.headline.toUpperCase()}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <section style={{ flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Integrity Map</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {state.units.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', background: 'rgba(255,255,255,0.01)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.state === UnitState.COLLAPSED ? 'var(--brand-brahmastra)' : u.state === UnitState.STRESSED ? '#ffa500' : 'var(--brand-yugma)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{u.id}</span>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700 }}>{u.state}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 900 }}>{(u.stress * 100).toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            onClick={onPropagate}
            style={{ width: '100%', padding: '0.85rem', background: 'var(--bg-accent)', border: '1px solid var(--border-strong)', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.7rem' }}
          >
            <TrendingUp size={16} />
            Propagate Shock
          </button>
        </aside>

        <main style={{ position: 'relative', overflow: 'hidden' }}>
          <NetworkGraph units={state.units} connections={state.connections} onSelectUnit={(u) => setSelectedUnitId(u.id)} />

          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(5,5,5,0.9)', padding: '0.6rem 1.2rem', borderRadius: '2px', border: '1px solid var(--brand-brahmastra)', backdropFilter: 'blur(10px)' }}>
              <Shield size={16} color="var(--brand-brahmastra)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.55rem', color: 'var(--brand-brahmastra)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stealth Module</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>MASKING: ACTIVE</span>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', zIndex: 10 }}>
            <div className="glass" style={{ padding: '1rem', height: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '0.2rem', border: '1px solid var(--border-strong)' }}>
              {logs.map((l, i) => (
                <div key={i} style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: i === 0 ? 'var(--brand-brahmastra)' : l.includes('INTEL') ? 'var(--brand-yugma)' : 'var(--text-dim)', borderLeft: i === 0 ? '2px solid var(--brand-brahmastra)' : '2px solid transparent', paddingLeft: '0.6rem' }}>
                  {l}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', opacity: 0.6 }}>
                <TerminalIcon size={12} />
                <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>APEX_SHELL v2.1</span>
              </div>
            </div>
          </div>
        </main>

        <aside className="glass" style={{ margin: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <Target size={20} color="var(--brand-brahmastra)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brand-brahmastra)', letterSpacing: '0.15em' }}>APEX_TACTICAL</h2>
          </header>

          <AnimatePresence mode="wait">
            {selectedUnit ? (
              <motion.div
                key={selectedUnit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--brand-brahmastra)', fontWeight: 900, marginBottom: '0.25rem', letterSpacing: '0.1em' }}>LOCK_ON</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{selectedUnit.id}</h3>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>REF: {Math.random().toString(16).slice(2, 8).toUpperCase()}</div>
                </div>

                <div className="intel-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SIGMA_STRESS</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--brand-brahmastra)' }}>{(selectedUnit.stress * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-accent)', borderRadius: 2 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedUnit.stress * 100}%` }}
                      style={{ height: '100%', background: 'var(--brand-brahmastra)' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,0,76,0.04)', borderRadius: '4px', border: '1px solid rgba(255,0,76,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <AlertTriangle size={14} color="var(--brand-brahmastra)" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--brand-brahmastra)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Perception_Masking</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>REPORTED_MORALE</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{(selectedUnit.modelOfSelf.perceivedMorale * 100).toFixed(1)}%</span>
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.4, fontStyle: 'italic', opacity: 0.8 }}>
                    "External monitoring blinded. Target perception remains stable."
                  </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    className="pulse-button"
                    onClick={() => onPulse(selectedUnit.id)}
                    disabled={selectedUnit.state === UnitState.COLLAPSED}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      background: selectedUnit.state === UnitState.COLLAPSED ? 'var(--bg-accent)' : 'linear-gradient(180deg, var(--brand-brahmastra), #8b0029)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: selectedUnit.state === UnitState.COLLAPSED ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      letterSpacing: '0.2em',
                      fontSize: '0.75rem',
                      boxShadow: selectedUnit.state === UnitState.COLLAPSED ? 'none' : '0 4px 15px rgba(255,0,76,0.2)'
                    }}
                  >
                    <Zap size={18} fill={selectedUnit.state === UnitState.COLLAPSED ? 'transparent' : "white"} />
                    {selectedUnit.state === UnitState.COLLAPSED ? 'TERMINATED' : 'INIT_COLLAPSE'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-dim)', opacity: 0.4 }}>
                <Target size={48} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                <h4 style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>IDLE: AWAITING_TARGET</h4>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      <style>{`
        .pulse-button:not(:disabled):hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 0, 76, 0.4);
        }
        .pulse-button:not(:disabled):active {
          transform: translateY(0);
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}

export default App;
