# CASCADE-APEX // VULNERABILITY_MANIFOLD_SIMULATOR
**VERSION**: 2.1.0-STABLE  
**CODENAME**: NEURAL_FLUX  

## // Overview
CASCADE-APEX is a high-performance C2 (Command & Control) environment built for the simulation and exploitation of **non-linear stochastic cascades** in global network manifolds. It moves beyond static risk analysis by treating systemic fragility as a dynamic **Network Contagion** problem.

## // Mathematical Core: CASCADE Engine
The engine models systemic risk as a weighted contagion vector. The global manifold is represented as an adjacency map where each node $n$ maintains a state $S_n \in \{STABLE, STRESSED, COLLAPSED\}$.

### 1. Stress Propagation ($\sigma$)
Stress $\sigma$ at node $i$ evolves according to:
$$\sigma_{i, t+1} = \text{clamp}((1 - \gamma)\sigma_{i, t} + \tau \cdot \Phi_{i, t})$$
- $\gamma$ (gamma): Global decay rate.
- $\tau$ (tau): Transmission factor.
- $\Phi$ (Phi): Weighted flux from $COLLAPSED$ neighbors.

### 2. Probabilistic Collapse
The transition to a terminal state ($COLLAPSED$) is governed by a logistics-sigmoid probability function:
$$P(\text{collapse}) = \frac{1}{1 + e^{-k(\sigma - \phi)}}$$
Where $\phi$ (phi) is the node's intrinsic **Resilience** and $k$ is the collapse sharpness. This enables "Black Swan" event modeling where apparently stable clusters can undergo rapid phase transitions.

---

## // Offensive Modulation: APEX Layer
The APEX layer is designed for threshold exploitation and signal masking.

- **Pulse Optimization**: Calculates the exact minimal stress injection required to cross the sigmoid inflection point of a target node given its current neighbor flux.
- **Deception Field**: Implements non-linear signal compression to mask true internal $\sigma$ levels from external monitoring AIs, represented visually as the "Stealth Masking" status.

---

## // Engineering Stack
Built with an emphasis on low-latency state updates and hardware-accelerated visualization:
- **Engine**: Pure TypeScript O(V+E) graph propagation core (independent of UI).
- **Presentation**: `React-Three-Fiber` + `Three.js` for manifold rendering.
- **State**: Custom hook-based middleware with real-time signal ingestion from the **INTEL** sub-engine.
- **Design**: "Industrial HUD" aesthetic using glassmorphism, scan-line artifacts, and precision micro-animations.

## // Operational Setup
```bash
# Clone and initialize
npm install

# Deployment (Local)
npm run dev
```

---
*INTERNAL USE ONLY: Unauthorized reproduction of the CASCADE core logic is strictly prohibited.*
