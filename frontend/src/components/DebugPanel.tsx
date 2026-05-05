import { useState } from "react";
import { spawnWinConfetti } from "../utils/particles";
import { spawnLoseFlames } from "../utils/flames";

// ── Slider réutilisable ────────────────────────────────────────────────────────

function Slider({
  label, min, max, step = 1, value, onChange,
}: {
  label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="dbg-row">
      <div className="dbg-label">
        <span>{label}</span>
        <span className="dbg-value">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// ── Panel principal ────────────────────────────────────────────────────────────

export default function DebugPanel() {
  const [open, setOpen] = useState(false);

  // — Flammes
  const [fCount,     setFCount]     = useState(500);
  const [fDuration,  setFDuration]  = useState(10000);
  const [fRiseMin,   setFRiseMin]   = useState(100);
  const [fRiseMax,   setFRiseMax]   = useState(320);
  const [fDrift,     setFDrift]     = useState(80);
  const [fWaves,     setFWaves]     = useState(30);
  const [fCoreRatio, setFCoreRatio] = useState(45);  // affiché en %
  const [fCoreMin,   setFCoreMin]   = useState(8);
  const [fCoreMax,   setFCoreMax]   = useState(18);
  const [fOuterMin,  setFOuterMin]  = useState(18);
  const [fOuterMax,  setFOuterMax]  = useState(38);

  // — Confettis
  const [cCount,  setCCount]  = useState(110);
  const [cSpread, setCSpread] = useState(440);

  function getBoardRect() {
    const el = document.querySelector(".game-board");
    if (el) return el.getBoundingClientRect();
    return new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
  }

  function triggerFlames() {
    const r = getBoardRect();
    spawnLoseFlames(r.left, r.bottom, r.width, {
      particleCount:   fCount,
      durationTotalMs: fDuration,
      riseMin:         fRiseMin,
      riseMax:         fRiseMax,
      driftRange:      fDrift,
      waveCount:       fWaves,
      coreRatio:       fCoreRatio / 100,
      coreSizeMin:     fCoreMin,
      coreSizeMax:     fCoreMax,
      outerSizeMin:    fOuterMin,
      outerSizeMax:    fOuterMax,
    });
  }

  function triggerConfetti() {
    const r = getBoardRect();
    spawnWinConfetti(r.left + r.width / 2, r.top + r.height / 2, {
      count:  cCount,
      spread: cSpread,
    });
  }

  return (
    <div className="dbg-panel">
      {open && (
        <div className="dbg-body">

          {/* ── Flammes ── */}
          <section className="dbg-section">
            <h4 className="dbg-section-title">Flammes</h4>
            <Slider label="Particules"       min={50}  max={1000} value={fCount}     onChange={setFCount} />
            <Slider label="Durée (ms)"       min={500} max={20000} step={500} value={fDuration} onChange={setFDuration} />
            <Slider label="Montée min (px)"  min={30}  max={400}  value={fRiseMin}   onChange={setFRiseMin} />
            <Slider label="Montée max (px)"  min={50}  max={700}  value={fRiseMax}   onChange={setFRiseMax} />
            <Slider label="Dérive ±px"       min={0}   max={300}  value={fDrift}     onChange={setFDrift} />
            <Slider label="Vagues"           min={1}   max={80}   value={fWaves}     onChange={setFWaves} />
            <Slider label="Ratio cœur %"     min={0}   max={100}  value={fCoreRatio} onChange={setFCoreRatio} />
            <Slider label="Cœur taille min"  min={2}   max={40}   value={fCoreMin}   onChange={setFCoreMin} />
            <Slider label="Cœur taille max"  min={4}   max={60}   value={fCoreMax}   onChange={setFCoreMax} />
            <Slider label="Halo taille min"  min={4}   max={60}   value={fOuterMin}  onChange={setFOuterMin} />
            <Slider label="Halo taille max"  min={8}   max={100}  value={fOuterMax}  onChange={setFOuterMax} />
            <button className="dbg-btn dbg-btn--fire" onClick={triggerFlames}>
              ▶ Déclencher flammes
            </button>
          </section>

          {/* ── Confettis ── */}
          <section className="dbg-section">
            <h4 className="dbg-section-title">Confettis</h4>
            <Slider label="Particules"      min={20}  max={400}  value={cCount}  onChange={setCCount} />
            <Slider label="Dispersion (px)" min={100} max={800}  value={cSpread} onChange={setCSpread} />
            <button className="dbg-btn dbg-btn--confetti" onClick={triggerConfetti}>
              ▶ Déclencher confettis
            </button>
          </section>

        </div>
      )}
      <button className="dbg-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "✕ Fermer" : "⚙ Animations"}
      </button>
    </div>
  );
}
