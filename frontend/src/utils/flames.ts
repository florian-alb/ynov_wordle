import gsap from "gsap";

// ── Valeurs par défaut ──────────────────

const DEFAULTS = {
  particleCount: 500, // nombre total de particules
  durationTotalMs: 10000, // durée totale de l'effet (ms)
  riseMin: 100, // hauteur min de montée (px)
  riseMax: 320, // hauteur max de montée (px)
  driftRange: 80, // dérive horizontale (±px)
  waveCount: 30, // nombre de vagues successives
  waveStagger: 0.55, // étalement des délais dans une vague (s)
  coreRatio: 0.45, // proportion de particules "cœur" (0–1)
  coreSizeMin: 8, // taille min du cœur (px)
  coreSizeMax: 18, // taille max du cœur (px)
  outerSizeMin: 18, // taille min du halo (px)
  outerSizeMax: 38, // taille max du halo (px)
  riseDurMin: 0.6, // durée min de montée (s)
  riseDurMax: 1.4, // durée max de montée (s)
  igniteDur: 0.14, // durée de l'allumage (s)
  coreBlurMin: 1, // flou min du cœur (px)
  coreBlurMax: 3, // flou max du cœur (px)
  outerBlurMin: 5, // flou min du halo (px)
  outerBlurMax: 9, // flou max du halo (px)
  coreOpacity: 0.98, // opacité max du cœur
  outerOpacity: 0.6, // opacité max du halo
};

export type FlameConfig = Partial<typeof DEFAULTS>;

// ── Couleurs ───────────────────────────────────────────────────────────────────

const FIRE_COLORS = [
  "#ff0000",
  "#ff2200",
  "#ff4400",
  "#ff6600",
  "#ff8800",
  "#ffaa00",
  "#ffcc00",
  "#ffee44",
];

// ── Utilitaire DOM ─────────────────────────────────────────────────────────────

function mkFlameEl(
  x: number,
  y: number,
  color: string,
  w: number,
  h: number,
): HTMLDivElement {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    background: color,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: "9999",
    mixBlendMode: "screen",
  });
  document.body.appendChild(el);
  return el;
}

// ── Export principal ───────────────────────────────────────────────────────────

export function spawnLoseFlames(
  bLeft: number,
  bBottom: number,
  bWidth: number,
  cfg: FlameConfig = {},
) {
  const C = { ...DEFAULTS, ...cfg };

  function spawnOne(spawnX: number, isCore: boolean, waveDelay: number) {
    const size = isCore
      ? C.coreSizeMin + Math.random() * (C.coreSizeMax - C.coreSizeMin)
      : C.outerSizeMin + Math.random() * (C.outerSizeMax - C.outerSizeMin);

    const colorIndex = isCore
      ? Math.floor(Math.random() * FIRE_COLORS.length)
      : Math.floor(Math.random() * 4);

    const el = mkFlameEl(
      spawnX,
      bBottom,
      FIRE_COLORS[colorIndex],
      size,
      size * (1.3 + Math.random() * 0.8),
    );
    el.style.filter = `blur(${
      isCore
        ? C.coreBlurMin + Math.random() * (C.coreBlurMax - C.coreBlurMin)
        : C.outerBlurMin + Math.random() * (C.outerBlurMax - C.outerBlurMin)
    }px)`;

    const riseHeight = -(C.riseMin + Math.random() * (C.riseMax - C.riseMin));
    const drift = (Math.random() - 0.5) * C.driftRange;
    const delay = waveDelay + Math.random() * C.waveStagger;
    const riseDur =
      C.riseDurMin + Math.random() * (C.riseDurMax - C.riseDurMin);

    const tl = gsap.timeline({ delay, onComplete: () => el.remove() });

    tl.fromTo(
      el,
      { x: 0, y: 0, scale: 0.1, opacity: 0 },
      {
        x: drift * 0.3,
        y: riseHeight * 0.25,
        scale: 1,
        opacity: isCore ? C.coreOpacity : C.outerOpacity,
        duration: C.igniteDur,
        ease: "power2.out",
      },
    );

    tl.to(el, {
      x: drift,
      y: riseHeight,
      scale: isCore ? 0.05 : 0.5,
      opacity: 0,
      duration: riseDur,
      ease: isCore ? "power2.out" : "power1.out",
    });
  }

  const perWave = Math.ceil(C.particleCount / C.waveCount);
  const waveInterval = C.durationTotalMs / 1000 / C.waveCount;

  for (let wave = 0; wave < C.waveCount; wave++) {
    const waveDelay = wave * waveInterval;
    for (let i = 0; i < perWave; i++) {
      spawnOne(
        bLeft + Math.random() * bWidth,
        Math.random() < C.coreRatio,
        waveDelay,
      );
    }
  }
}
