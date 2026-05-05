import gsap from "gsap";

const WIN_COLORS = [
  "#538d4e", "#6aaa64", "#b59f3b", "#c9b458",
  "#ffffff", "#ffd700", "#ff8c69", "#4ecdc4", "#ff69b4", "#87ceeb",
];
const CORRECT_COLORS = ["#538d4e", "#6aaa64", "#a8d8a8", "#ffffff"];
const MISPLACED_COLORS = ["#b59f3b", "#c9b458", "#ffe066", "#ffffff"];

function mkEl(x: number, y: number, color: string, w: number, h: number, round: boolean): HTMLDivElement {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    background: color,
    borderRadius: round ? "50%" : "2px",
    pointerEvents: "none",
    zIndex: "9999",
  });
  document.body.appendChild(el);
  return el;
}

// ── Tile reveal burst ──────────────────────────────────────────────────────────

export function spawnTileParticles(x: number, y: number, feedback: "CORRECT" | "MISPLACED") {
  const colors = feedback === "CORRECT" ? CORRECT_COLORS : MISPLACED_COLORS;

  for (let i = 0; i < 10; i++) {
    const size = 3 + Math.random() * 5;
    const el = mkEl(x, y, colors[Math.floor(Math.random() * colors.length)], size, size, Math.random() > 0.4);
    const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = 55 * (0.4 + Math.random() * 0.6);

    gsap.fromTo(el,
      { x: 0, y: 0, scale: 1.2, opacity: 1, rotation: 0 },
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 20,
        scale: 0.1,
        opacity: 0,
        rotation: (Math.random() - 0.5) * 360,
        duration: 0.5 + Math.random() * 0.3,
        delay: Math.random() * 0.08,
        ease: "power2.out",
        onComplete: () => el.remove(),
      },
    );
  }
}

// ── Win confetti (mortar burst + gravity) ──────────────────────────────────────

export interface ConfettiConfig {
  count?: number;  // nombre de confettis (défaut 110)
  spread?: number; // dispersion max en px (défaut 440)
}

export function spawnWinConfetti(x: number, y: number, cfg: ConfettiConfig = {}) {
  const count = cfg.count ?? 110;
  const spread = cfg.spread ?? 440;

  for (let i = 0; i < count; i++) {
    const w = 6 + Math.random() * 9;
    const h = Math.random() > 0.45 ? w : w * (0.18 + Math.random() * 0.4);
    const el = mkEl(x, y, WIN_COLORS[Math.floor(Math.random() * WIN_COLORS.length)], w, h, Math.random() > 0.5);

    const spreadAngle = (Math.random() - 0.5) * Math.PI * 1.6;
    const dist = spread * (0.35 + Math.random() * 0.65);
    const tx = Math.sin(spreadAngle) * dist;
    const upY = -(90 + Math.random() * 240);

    const tl = gsap.timeline({ delay: Math.random() * 0.3, onComplete: () => el.remove() });

    tl.fromTo(el,
      { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 },
      {
        x: tx, y: upY,
        scale: 0.8 + Math.random() * 0.5,
        rotation: (Math.random() - 0.5) * 360,
        duration: 0.22 + Math.random() * 0.18,
        ease: "power3.out",
      },
    );

    tl.to(el, {
      x: tx + (Math.random() - 0.5) * 70,
      y: upY + (260 + Math.random() * 340),
      opacity: 0,
      scale: 0.05 + Math.random() * 0.2,
      rotation: `+=${(Math.random() - 0.5) * 540}`,
      duration: 0.85 + Math.random() * 0.65,
      ease: "power1.in",
    });
  }
}
