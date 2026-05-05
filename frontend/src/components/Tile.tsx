import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { spawnTileParticles } from "../utils/particles";

type LetterFeedback = "CORRECT" | "MISPLACED" | "ABSENT";

interface TileProps {
  letter?: string;
  feedback?: LetterFeedback;
  isRevealing?: boolean;
  revealDelay?: number;
  isBouncing?: boolean;
  bounceDelay?: number;
  isCursor?: boolean;
}

export default function Tile({
  letter,
  feedback,
  isRevealing,
  revealDelay = 0,
  isBouncing,
  bounceDelay = 0,
  isCursor,
}: TileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const prevLetter = useRef<string | undefined>(undefined);

  // Immediately show feedback for tiles that skip the reveal animation
  useEffect(() => {
    if (feedback && !isRevealing) setShowFeedback(true);
  }, [feedback, isRevealing]);

  // Flip reveal animation
  useEffect(() => {
    if (!isRevealing || !tileRef.current) return;
    setShowFeedback(false);

    const rect = tileRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const tl = gsap.timeline({ delay: revealDelay });
    tl.to(tileRef.current, { rotateX: 90, duration: 0.22, ease: "power2.in" });
    tl.call(() => {
      setShowFeedback(true);
      if (feedback === "CORRECT" || feedback === "MISPLACED") {
        spawnTileParticles(cx, cy, feedback);
      }
    });
    tl.to(tileRef.current, { rotateX: 0, duration: 0.22, ease: "power2.out" });

    return () => { tl.kill(); };
  }, [isRevealing, revealDelay]);

  // Win bounce animation
  useEffect(() => {
    if (!isBouncing || !tileRef.current) return;

    const tl = gsap.timeline({ delay: bounceDelay });
    tl.to(tileRef.current, { y: -28, scale: 1.05, duration: 0.18, ease: "power2.out" });
    tl.to(tileRef.current, { y: 0, scale: 1, duration: 0.18, ease: "bounce.out" });

    return () => { tl.kill(); };
  }, [isBouncing, bounceDelay]);

  // Pop-in on type, pop-out on delete
  useEffect(() => {
    if (!tileRef.current) return;
    if (letter && letter !== prevLetter.current) {
      gsap.fromTo(tileRef.current, { scale: 1.12 }, { scale: 1, duration: 0.1, ease: "power2.out" });
    } else if (!letter && prevLetter.current) {
      gsap.fromTo(tileRef.current, { scale: 1 }, {
        scale: 0.78, duration: 0.07, ease: "power2.in",
        onComplete: () => { if (tileRef.current) gsap.to(tileRef.current, { scale: 1, duration: 0.08, ease: "power2.out" }); },
      });
    }
    prevLetter.current = letter;
  }, [letter]);

  let className = "tile";
  if (!letter) {
    className += isCursor ? " tile-cursor" : " tile-empty";
  } else if (showFeedback && feedback) {
    className += ` tile-${feedback.toLowerCase()}`;
  } else {
    className += " tile-filled";
  }

  return (
    <div ref={tileRef} className={className}>
      {letter?.toUpperCase()}
    </div>
  );
}
