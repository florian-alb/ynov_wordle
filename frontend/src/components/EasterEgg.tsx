import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";

export default function EasterEgg({ onDone }: { onDone: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const manRef = useRef<SVGGElement>(null);
  const manHipsRef = useRef<SVGGElement>(null);
  const manTorsoRef = useRef<SVGGElement>(null);
  const femmeBodyRef = useRef<SVGGElement>(null);
  const femmeHeadRef = useRef<SVGGElement>(null);
  const femmeHairRef = useRef<SVGGElement>(null);
  const femmeBreastRef = useRef<SVGGElement>(null);
  const impactRef = useRef<SVGGElement>(null);
  const heartsRef = useRef<HTMLDivElement>(null);
  const sweatRef = useRef<HTMLDivElement>(null);

  const spawnHeart = useCallback(() => {
    if (!heartsRef.current) return;
    const el = document.createElement("span");
    const emojis = ["❤️", "💕", "🔥", "✨", "💫"];
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const startX = 100 + Math.random() * 140;
    el.style.cssText = `position:absolute;font-size:${16 + Math.random() * 14}px;left:${startX}px;bottom:80px;pointer-events:none;filter:drop-shadow(0 0 4px rgba(255,100,150,0.6));`;
    heartsRef.current.appendChild(el);
    gsap.to(el, {
      y: -(110 + Math.random() * 100),
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
    el.style.cssText = `position:absolute;font-size:13px;left:${215 + Math.random() * 25}px;top:35px;pointer-events:none;`;
    sweatRef.current.appendChild(el);
    gsap.to(el, {
      y: 35,
      x: (Math.random() - 0.5) * 25,
      opacity: 0,
      duration: 0.7,
      ease: "power2.in",
      onComplete: () => el.remove(),
    });
  }, []);

  useEffect(() => {
    if (!overlayRef.current || !manRef.current || !femmeBodyRef.current) return;

    gsap.fromTo(
      overlayRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.5)" },
    );

    // Poussée de l'homme (le bassin avance vers la femme)
    gsap.to(manHipsRef.current, {
      x: -8,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });

    // Torse de l'homme qui suit
    gsap.to(manTorsoRef.current, {
      rotation: -4,
      x: -3,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
      transformOrigin: "50% 100%",
    });

    // Femme : encaisse l'impact (avancée légère + squash)
    gsap.to(femmeBodyRef.current, {
      x: -5,
      scaleY: 0.96,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
      transformOrigin: "center bottom",
      delay: 0.04,
    });

    // Tête qui dodeline
    gsap.to(femmeHeadRef.current, {
      rotation: -10,
      x: -4,
      y: 1,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      transformOrigin: "center center",
      delay: 0.08,
    });

    // Cheveux avec inertie
    gsap.to(femmeHairRef.current, {
      rotation: -16,
      duration: 0.22,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      transformOrigin: "60px 52px",
      delay: 0.12,
    });

    // Poitrine qui rebondit
    gsap.to(femmeBreastRef.current, {
      y: 2.5,
      scaleY: 1.18,
      duration: 0.18,
      yoyo: true,
      repeat: -1,
      ease: "power2.out",
      transformOrigin: "center top",
      delay: 0.09,
    });

    // Étoile d'impact qui flash à chaque poussée
    gsap.to(impactRef.current, {
      scale: 1.4,
      opacity: 1,
      duration: 0.09,
      yoyo: true,
      repeat: -1,
      ease: "power2.out",
      transformOrigin: "center center",
    });

    // Accélération progressive
    gsap.to(
      [
        manHipsRef.current,
        manTorsoRef.current,
        femmeBodyRef.current,
        femmeHeadRef.current,
        femmeHairRef.current,
        femmeBreastRef.current,
        impactRef.current,
      ],
      {
        timeScale: 1.7,
        duration: 5,
        ease: "power2.in",
      },
    );

    // Coeurs avec accélération
    let heartInterval = 700;
    const heartTimer = { current: 0 };
    const heartLoop = () => {
      spawnHeart();
      heartInterval = Math.max(220, heartInterval - 28);
      heartTimer.current = window.setTimeout(heartLoop, heartInterval);
    };
    heartLoop();

    // Sueur
    const sweatStart = setTimeout(() => {
      const sweatInterval = setInterval(spawnSweat, 450);
      setTimeout(() => clearInterval(sweatInterval), 4000);
    }, 1800);

    // Auto-fermeture
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
      gsap.killTweensOf([
        manHipsRef.current,
        manTorsoRef.current,
        femmeBodyRef.current,
        femmeHeadRef.current,
        femmeHairRef.current,
        femmeBreastRef.current,
        impactRef.current,
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
        background: "rgba(0,0,0,0.92)",
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
          {/* Sol */}
          <line
            x1={20}
            y1={170}
            x2={300}
            y2={170}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
          <ellipse
            cx={160}
            cy={172}
            rx={130}
            ry={3}
            fill="rgba(255,255,255,0.06)"
          />

          {/* ══════════ FEMME (à quatre pattes, sol à y=170) ══════════ */}
          {/* Les mains et genoux sont au sol (y=170) */}
          <g
            ref={femmeBodyRef}
            stroke="#fff"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            {/* === BRAS (épaule → coude → main au sol) === */}
            {/* Bras gauche */}
            <path d="M 75 95 Q 68 130 60 168" />
            <circle cx={60} cy={170} r={2.5} fill="#fff" />
            {/* Bras droit (un peu en avant) */}
            <path d="M 90 98 Q 85 132 78 168" />
            <circle cx={78} cy={170} r={2.5} fill="#fff" />

            {/* === DOS CAMBRÉ (épaules → bassin) === */}
            {/* Courbe avec creux marqué au milieu */}
            <path d="M 82 92 Q 110 78 140 82 Q 158 86 168 96" />

            {/* Petites lignes pour suggérer la cambrure */}
            <path
              d="M 105 84 Q 125 80 145 84"
              stroke="#fff"
              strokeWidth={1.5}
              opacity={0.5}
            />

            {/* === POITRINE (suspendue sous le torse) === */}
            <g ref={femmeBreastRef}>
              <ellipse
                cx={92}
                cy={102}
                rx={5}
                ry={8}
                fill="#fff"
                opacity={0.95}
              />
              <ellipse
                cx={104}
                cy={104}
                rx={5}
                ry={8}
                fill="#fff"
                opacity={0.95}
              />
            </g>

            {/* === FESSES (courbe pleine) === */}
            <path
              d="M 158 88 Q 175 86 178 100 Q 178 110 168 110 Z"
              fill="rgba(255,255,255,0.12)"
              stroke="#fff"
              strokeWidth={2}
            />

            {/* === JAMBES (cuisse → genou au sol → tibia → pied) === */}
            {/* Position quatre pattes : cuisse horizontale, genou plié à 90°, tibia vertical au sol */}

            {/* Jambe gauche */}
            {/* Cuisse : du bassin vers le genou (descend et avance légèrement) */}
            <path d="M 168 100 Q 170 130 165 168" />
            {/* Genou */}
            <circle cx={165} cy={168} r={2} fill="#fff" />

            {/* Jambe droite */}
            <path d="M 172 100 Q 178 130 178 168" />
            <circle cx={178} cy={168} r={2} fill="#fff" />

            {/* === TÊTE + CHEVEUX === */}
            <g ref={femmeHeadRef}>
              {/* Cou */}
              <line x1={75} y1={90} x2={68} y2={78} />
              {/* Tête */}
              <circle cx={62} cy={68} r={11} fill="#fff" />
              {/* Cheveux qui pendent */}
              <g
                ref={femmeHairRef}
                stroke="#fff"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              >
                <path d="M 53 65 Q 46 82 42 100" />
                <path d="M 56 73 Q 50 90 46 108" />
                <path d="M 61 76 Q 58 95 56 112" />
                <path d="M 67 76 Q 66 92 64 105" />
              </g>
            </g>
          </g>

          {/* ══════════ HOMME (agenouillé derrière la femme) ══════════ */}
          {/* Genoux au sol à y=170, bassin aligné avec celui de la femme */}
          <g
            ref={manRef}
            stroke="#fff"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            {/* === BASSIN + JAMBES (groupe qui pousse) === */}
            <g ref={manHipsRef}>
              {/* Bassin de l'homme - aligné avec celui de la femme à y~100 */}
              {/* Petit point bassin */}
              <circle cx={195} cy={105} r={2} fill="#fff" />

              {/* === BRAS qui agrippent les hanches de la femme === */}
              {/* Bras gauche : épaule → main sur la hanche de la femme */}
              <path d="M 210 88 Q 195 95 178 100" />
              <circle cx={178} cy={100} r={2.5} fill="#fff" />
              {/* Bras droit : épaule → main sur l'autre hanche */}
              <path d="M 215 92 Q 200 102 180 108" />
              <circle cx={180} cy={108} r={2.5} fill="#fff" />

              {/* === JAMBES AGENOUILLÉES === */}
              {/* En position agenouillée : cuisse descend, genou au sol, tibia plié vers l'arrière (sous les fesses) */}

              {/* Jambe gauche */}
              {/* Cuisse : bassin (195,105) → genou (210,170) au sol */}
              <path d="M 195 105 L 208 168" />
              {/* Genou */}
              <circle cx={208} cy={170} r={2.5} fill="#fff" />
              {/* Tibia replié vers l'arrière (sous les fesses) */}
              <path d="M 208 170 L 230 165" />
              {/* Pied */}
              <line x1={230} y1={165} x2={236} y2={167} />

              {/* Jambe droite */}
              <path d="M 195 105 L 220 168" />
              <circle cx={220} cy={170} r={2.5} fill="#fff" />
              <path d="M 220 170 L 245 167" />
              <line x1={245} y1={167} x2={252} y2={169} />
            </g>

            {/* === TORSE (penché en avant vers la femme) === */}
            <g ref={manTorsoRef}>
              {/* Du bassin vers les épaules - penché vers l'avant (gauche) */}
              <path d="M 195 105 Q 205 80 212 60" />
              {/* Cou */}
              <line x1={212} y1={60} x2={216} y2={52} />
              {/* Tête */}
              <circle cx={220} cy={42} r={11} fill="#fff" />
              {/* Cheveux courts (3 mèches discrètes sur le dessus) */}
              <path
                d="M 213 32 Q 213 29 215 30"
                stroke="#fff"
                strokeWidth={1.8}
                fill="none"
              />
              <path
                d="M 219 31 Q 219 28 221 29"
                stroke="#fff"
                strokeWidth={1.8}
                fill="none"
              />
              <path
                d="M 225 32 Q 225 29 227 30"
                stroke="#fff"
                strokeWidth={1.8}
                fill="none"
              />
            </g>
          </g>

          {/* === ÉTOILE D'IMPACT au point de contact === */}
          <g ref={impactRef} opacity={0.6} transform="translate(178, 102)">
            <path
              d="M 0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z"
              fill="#ffeb3b"
            />
            <path
              d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z"
              fill="#fff"
            />
          </g>

          {/* Lignes de mouvement derrière l'homme */}
          <g
            stroke="#fff"
            strokeWidth={1.2}
            opacity={0.35}
            strokeLinecap="round"
          >
            <line x1={255} y1={70} x2={270} y2={70} strokeDasharray="3 3">
              <animate
                attributeName="opacity"
                values="0;0.5;0"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </line>
            <line x1={258} y1={90} x2={278} y2={90} strokeDasharray="3 3">
              <animate
                attributeName="opacity"
                values="0;0.4;0"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </line>
            <line x1={262} y1={110} x2={282} y2={110} strokeDasharray="3 3">
              <animate
                attributeName="opacity"
                values="0;0.45;0"
                dur="0.45s"
                repeatCount="indefinite"
              />
            </line>
          </g>
        </svg>

        <div
          ref={heartsRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "visible",
          }}
        />
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
