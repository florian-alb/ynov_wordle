import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";

export default function EasterEgg({ onDone }: { onDone: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const manRef = useRef<SVGGElement>(null);
  const manHipsRef = useRef<SVGGElement>(null);
  const manTorsoRef = useRef<SVGGElement>(null);
  const femmeRef = useRef<SVGGElement>(null);
  const femmeBodyRef = useRef<SVGGElement>(null);
  const femmeHeadRef = useRef<SVGGElement>(null);
  const femmeHairRef = useRef<SVGGElement>(null);
  const femmeBreastRef = useRef<SVGGElement>(null);
  const heartsRef = useRef<HTMLDivElement>(null);
  const sweatRef = useRef<HTMLDivElement>(null);

  const spawnHeart = useCallback(() => {
    if (!heartsRef.current) return;
    const el = document.createElement("span");
    const emojis = ["❤️", "💕", "🔥", "✨", "💫"];
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const startX = 80 + Math.random() * 180;
    el.style.cssText = `position:absolute;font-size:${16 + Math.random() * 16}px;left:${startX}px;bottom:70px;pointer-events:none;filter:drop-shadow(0 0 4px rgba(255,100,150,0.6));`;
    heartsRef.current.appendChild(el);
    gsap.to(el, {
      y: -(100 + Math.random() * 120),
      x: (Math.random() - 0.5) * 60,
      opacity: 0,
      scale: 0.3,
      rotation: (Math.random() - 0.5) * 90,
      duration: 1.4 + Math.random() * 0.8,
      ease: "power1.out",
      onComplete: () => el.remove(),
    });
  }, []);

  const spawnSweat = useCallback(() => {
    if (!sweatRef.current) return;
    const el = document.createElement("span");
    el.textContent = "💦";
    el.style.cssText = `position:absolute;font-size:14px;left:${190 + Math.random() * 30}px;top:30px;pointer-events:none;`;
    sweatRef.current.appendChild(el);
    gsap.to(el, {
      y: 40,
      x: (Math.random() - 0.5) * 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.in",
      onComplete: () => el.remove(),
    });
  }, []);

  useEffect(() => {
    if (!overlayRef.current || !manRef.current || !femmeRef.current) return;

    // Entrée
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.5)" },
    );

    // === ANIMATION RYTHMIQUE SYNCHRONISÉE ===
    // Timeline principale qui crée un rythme accélérant
    const masterTl = gsap.timeline({ repeat: -1 });

    // Phase 1 : rythme lent (0-2s)
    // Phase 2 : rythme moyen (2-4s)
    // Phase 3 : rythme rapide/frénétique (4-6s)

    // Mouvement de poussée de l'homme (avant/arrière avec impact)
    const manThrust = gsap.timeline({ repeat: -1 });
    manThrust
      .to(manHipsRef.current, {
        x: -10,
        duration: 0.18,
        ease: "power2.in", // accélération vers l'impact
      })
      .to(manHipsRef.current, {
        x: 0,
        duration: 0.22,
        ease: "power1.out", // recul plus mou
      });

    // Torse qui se penche légèrement à chaque poussée
    gsap.to(manTorsoRef.current, {
      rotation: -3,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "power2.in",
      transformOrigin: "50% 100%",
    });

    // Femme : corps qui encaisse l'impact (squash subtil)
    gsap.to(femmeBodyRef.current, {
      x: -4,
      scaleY: 0.97,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "power2.in",
      transformOrigin: "center center",
      delay: 0.05, // léger décalage = réaction
    });

    // Tête de la femme qui dodeline (rythme suit l'impact)
    gsap.to(femmeHeadRef.current, {
      rotation: -12,
      x: -3,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      transformOrigin: "center center",
      delay: 0.08,
    });

    // Cheveux qui suivent avec un délai (effet inertie)
    gsap.to(femmeHairRef.current, {
      rotation: -18,
      y: 2,
      duration: 0.22,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      transformOrigin: "60px 50px",
      delay: 0.14, // plus de retard = inertie cheveux
    });

    // Poitrine qui rebondit (rebond physique)
    gsap.to(femmeBreastRef.current, {
      y: 2,
      scaleY: 1.15,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "power2.out",
      transformOrigin: "center top",
      delay: 0.1,
    });

    // Accélération progressive du rythme
    gsap.to(
      [
        manHipsRef.current,
        manTorsoRef.current,
        femmeBodyRef.current,
        femmeHeadRef.current,
        femmeHairRef.current,
        femmeBreastRef.current,
      ],
      {
        timeScale: 1.8,
        duration: 5,
        ease: "power2.in",
      },
    );

    // Coeurs : fréquence qui augmente
    let heartInterval = 700;
    const heartTimer = { current: 0 };
    const heartLoop = () => {
      spawnHeart();
      heartInterval = Math.max(200, heartInterval - 30);
      heartTimer.current = window.setTimeout(heartLoop, heartInterval);
    };
    heartLoop();

    // Sueur de l'homme (apparaît après 2s)
    const sweatStart = setTimeout(() => {
      const sweatInterval = setInterval(spawnSweat, 400);
      setTimeout(() => clearInterval(sweatInterval), 4000);
    }, 2000);

    // Auto-fermeture 6s
    const timeout = setTimeout(() => {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 0.4,
        ease: "power2.in",
        onComplete: onDone,
      });
    }, 6000);

    return () => {
      clearTimeout(heartTimer.current);
      clearTimeout(sweatStart);
      clearTimeout(timeout);
      masterTl.kill();
      manThrust.kill();
      gsap.killTweensOf([
        manHipsRef.current,
        manTorsoRef.current,
        femmeBodyRef.current,
        femmeHeadRef.current,
        femmeHairRef.current,
        femmeBreastRef.current,
      ]);
    };
  }, [onDone, spawnHeart, spawnSweat]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.88)",
        cursor: "pointer",
        gap: 20,
      }}
      onClick={onDone}
    >
      <p
        style={{
          fontSize: "1.4rem",
          fontWeight: 900,
          color: "#ffd700",
          letterSpacing: "0.05em",
        }}
      >
        🏆 Génie en moins de 3 essais !
      </p>

      <div style={{ position: "relative" }}>
        <svg
          viewBox="0 0 320 200"
          width={320}
          height={200}
          style={{ overflow: "visible" }}
        >
          {/* Sol/ombre */}
          <ellipse
            cx={160}
            cy={175}
            rx={120}
            ry={4}
            fill="rgba(255,255,255,0.08)"
          />

          {/* ══════════ FEMME (à quatre pattes) ══════════ */}
          <g
            ref={femmeRef}
            stroke="#fff"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <g ref={femmeBodyRef}>
              {/* Bras gauche (appui ferme) */}
              <path d="M 78 82 Q 70 100 62 122 L 56 138" />
              {/* Bras droit (appui) */}
              <path d="M 100 84 Q 92 106 84 126 L 80 140" />
              {/* Mains (petits cercles) */}
              <circle cx={56} cy={140} r={2.5} fill="#fff" />
              <circle cx={80} cy={142} r={2.5} fill="#fff" />

              {/* Colonne vertébrale courbée (cambrée) */}
              <path d="M 70 78 Q 105 70 140 80 Q 155 84 158 88" />

              {/* Poitrine (suspendue, qui rebondit) */}
              <g ref={femmeBreastRef}>
                <ellipse
                  cx={92}
                  cy={92}
                  rx={5}
                  ry={7}
                  fill="#fff"
                  opacity={0.95}
                />
                <ellipse
                  cx={104}
                  cy={94}
                  rx={5}
                  ry={7}
                  fill="#fff"
                  opacity={0.95}
                />
              </g>

              {/* Hanches/fesses (courbe marquée) */}
              <path
                d="M 140 80 Q 158 78 165 88 Q 168 95 162 100"
                fill="rgba(255,255,255,0.08)"
              />

              {/* Jambe gauche (pliée, genou au sol) */}
              <path d="M 155 92 Q 158 110 152 128 L 145 148" />
              {/* Pied gauche */}
              <line x1={145} y1={148} x2={138} y2={150} />

              {/* Jambe droite (pliée) */}
              <path d="M 158 92 Q 168 110 168 128 L 165 148" />
              {/* Pied droit */}
              <line x1={165} y1={148} x2={172} y2={150} />

              {/* Tête + cou + cheveux */}
              <g ref={femmeHeadRef}>
                {/* Cou */}
                <line x1={70} y1={78} x2={66} y2={70} />
                {/* Tête */}
                <circle cx={60} cy={60} r={11} fill="#fff" />
                {/* Cheveux longs (mèches qui tombent) */}
                <g ref={femmeHairRef} stroke="#fff" strokeWidth={2} fill="none">
                  <path d="M 51 58 Q 45 75 42 92" />
                  <path d="M 55 68 Q 50 85 47 100" />
                  <path d="M 60 70 Q 58 88 56 105" />
                  <path d="M 65 70 Q 64 85 63 98" />
                </g>
              </g>
            </g>
          </g>

          {/* ══════════ HOMME (agenouillé derrière) ══════════ */}
          <g
            ref={manRef}
            stroke="#fff"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            {/* Bassin/hanches (groupe qui pousse) */}
            <g ref={manHipsRef}>
              {/* Hanches connectées */}
              <path d="M 175 100 Q 172 95 168 92" />

              {/* Bras gauche (tient la hanche de la femme - prise ferme) */}
              <path d="M 192 78 Q 180 82 168 88 L 162 92" />
              {/* Main gauche */}
              <circle cx={162} cy={92} r={2.5} fill="#fff" />

              {/* Bras droit (tient l'autre hanche) */}
              <path d="M 200 80 Q 190 88 178 94 L 172 98" />
              {/* Main droite */}
              <circle cx={172} cy={98} r={2.5} fill="#fff" />

              {/* Jambe gauche (agenouillée, tibia au sol) */}
              <path d="M 178 102 Q 170 120 165 138 L 160 158" />
              <line x1={160} y1={158} x2={150} y2={160} />

              {/* Jambe droite (agenouillée) */}
              <path d="M 182 102 Q 188 120 188 138 L 185 158" />
              <line x1={185} y1={158} x2={195} y2={160} />
            </g>

            {/* Torse (penché en avant) */}
            <g ref={manTorsoRef}>
              <path d="M 178 100 Q 188 80 198 60" />
              {/* Cou */}
              <line x1={198} y1={60} x2={202} y2={52} />
              {/* Tête */}
              <circle cx={208} cy={42} r={11} fill="#fff" />
              {/* Cheveux courts (petites mèches) */}
              <line x1={200} y1={34} x2={199} y2={31} />
              <line x1={205} y1={32} x2={205} y2={29} />
              <line x1={210} y1={31} x2={211} y2={28} />
              <line x1={215} y1={33} x2={216} y2={30} />
            </g>
          </g>

          {/* Lignes de mouvement (effet vitesse) */}
          <g stroke="#fff" strokeWidth={1} opacity={0.3} strokeLinecap="round">
            <line x1={220} y1={70} x2={235} y2={70} strokeDasharray="3 3">
              <animate
                attributeName="opacity"
                values="0;0.5;0"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </line>
            <line x1={225} y1={85} x2={245} y2={85} strokeDasharray="3 3">
              <animate
                attributeName="opacity"
                values="0;0.4;0"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </line>
          </g>
        </svg>

        {/* Coeurs */}
        <div
          ref={heartsRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "visible",
          }}
        />
        {/* Sueur */}
        <div
          ref={sweatRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "visible",
          }}
        />
      </div>

      <p style={{ color: "#818384", fontSize: "0.82rem" }}>
        Clique pour fermer
      </p>
    </div>
  );
}
