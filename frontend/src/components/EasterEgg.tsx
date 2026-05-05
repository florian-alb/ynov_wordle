import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";

// SVG affiché à cette taille (viewBox 1016×941)
const SVG_W = 460;
const SVG_H = Math.round((941.93 / 1016.03) * SVG_W); // ≈ 426

// Tête de l'homme : centre ≈ (360, 155) dans le viewBox → coordonnées rendues
const HEAD_X = Math.round((360 / 1016.03) * SVG_W); // ≈ 163
const HEAD_Y = Math.round((155 / 941.93) * SVG_H);  // ≈ 70

const EMOJIS = ["💦", "💦", "💦", "💦", "💦", "❤️", "🔥", "✨", "😮‍💨"];

export default function EasterEgg({ onDone }: { onDone: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const manRef     = useRef<SVGGElement>(null);
  const heartsRef  = useRef<HTMLDivElement>(null);

  const spawnEmoji = useCallback(() => {
    if (!heartsRef.current) return;
    const el = document.createElement("span");
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    el.style.cssText = `
      position: absolute;
      font-size: ${28 + Math.random() * 22}px;
      left: ${HEAD_X - 24 + Math.random() * 48}px;
      top: ${HEAD_Y - 10}px;
      pointer-events: none;
    `;
    heartsRef.current.appendChild(el);
    gsap.fromTo(el,
      { y: 0, opacity: 1, scale: 1 },
      {
        y: -(55 + Math.random() * 55),
        x: (Math.random() - 0.5) * 44,
        opacity: 0,
        scale: 0.3,
        duration: 1.1 + Math.random() * 0.7,
        ease: "power1.out",
        onComplete: () => el.remove(),
      },
    );
  }, []);

  useEffect(() => {
    if (!overlayRef.current || !manRef.current) return;

    // Fade in overlay
    gsap.fromTo(overlayRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.5)" },
    );

    // Translation va-et-vient de l'homme
    gsap.to(manRef.current, {
      x: -28,
      duration: 0.22,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });

    // Emojis au-dessus de sa tête avec accélération progressive
    let interval = 700;
    const timer = { id: 0 as unknown as ReturnType<typeof setTimeout> };
    const loop = () => {
      spawnEmoji();
      interval = Math.max(230, interval - 22);
      timer.id = setTimeout(loop, interval);
    };
    loop();

    // Auto-fermeture après 6 s
    const closeId = setTimeout(() => {
      gsap.to(overlayRef.current, {
        opacity: 0, scale: 0.85, duration: 0.4, ease: "power2.in",
        onComplete: onDone,
      });
    }, 6000);

    return () => {
      clearTimeout(timer.id);
      clearTimeout(closeId);
    };
  }, [onDone, spawnEmoji]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed", inset: 0, zIndex: 20000,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.92)", cursor: "pointer", gap: 20,
      }}
      onClick={onDone}
    >
      <p style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ffd700", letterSpacing: "0.05em" }}>
        🏆 Génie en moins de 3 essais !
      </p>

      <div style={{ position: "relative", width: SVG_W, height: SVG_H }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1016.03 941.93"
          width={SVG_W}
          height={SVG_H}
          fill="white"
        >
          <g id="woman">
            <path d="M847.73,432.77c40.61-5.52,76.86,23.26,81.72,63.07,4.83,39.61-23.25,76.2-63.81,80.81-38.86,4.42-75.19-23.24-80.07-63.39-4.64-38.19,21.85-75.01,62.15-80.49Z" />
            <path d="M763.56,549.48l-338.95-.23c-19.18,2.52-32.46,19.64-30.8,39.05l42.97,217.06-10.37.57-68.42-.22-220.65.23c-18.55.02-32.16,16.66-31.86,33.89.31,17.88,14.61,32.94,33.32,32.94h338.74c20.25,0,37.13-18.02,33.09-38.55l-42.88-217.89,149.41-.04c.63,15.65,9.48,29.62,21.57,37.07,14.88,9.17,31.19,9.4,46.18,2.33l43.39-20.47-.41,55.26-.46,151.83c-.05,18.04,17.28,30.67,33.62,30.41,16.25-.25,32.37-12.85,32.56-30.34l.88-82.1.97-179.71c-1.98-15.8-14.78-31.07-31.9-31.09Z" />
          </g>
          <g ref={manRef} id="man">
            <path d="M339.85,80.76c40.65-5.91,76.95,22.47,82.36,61.9,5.38,39.24-21.99,75.66-61.19,81.49-39.54,5.88-76.51-21.47-82.35-61.16s20.78-76.36,61.18-82.23Z" />
            <path d="M505.63,594.85c-2.97,4.93-7.24,9.16-12.65,12.13-15.52,8.52-34.82,3.56-44.4-10.96l-107.29-194.66-.06,188.16h89.39c1.58,0,3.1.25,4.51.72,5.32,1.77,9.13,6.6,9.13,12.25s-3.81,10.48-9.13,12.25c-1.41.46-2.93.72-4.51.72,0,0-75.84.21-75.77.31,4.35,6.22,5.5,12.92,2.56,14.98-2.69,1.88-7.91-.81-12.1-6.09l40.31,203.29-25.05,44.82-43.37-45.04-43.24-218.57v-336.55c-.26-16.23,9.04-29.16,23.44-33.77,13.92-4.45,31.5.24,39.1,14.09l171.37,311.35h.01c4.29,10.2,3.2,21.55-2.25,30.57Z" />
          </g>
        </svg>

        {/* Emojis flottants au-dessus de la tête de l'homme */}
        <div
          ref={heartsRef}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
        />
      </div>

      <p style={{ color: "#818384", fontSize: "0.82rem" }}>Clique pour fermer</p>
    </div>
  );
}
