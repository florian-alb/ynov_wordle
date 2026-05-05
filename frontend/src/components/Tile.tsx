import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type LetterFeedback = "CORRECT" | "MISPLACED" | "ABSENT";

interface TileProps {
  letter?: string;
  feedback?: LetterFeedback;
  isRevealing?: boolean;
  revealDelay?: number;
  isBouncing?: boolean;
  bounceDelay?: number;
}

export default function Tile({
  letter,
  feedback,
  isRevealing,
  revealDelay = 0,
  isBouncing,
  bounceDelay = 0,
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

    const tl = gsap.timeline({ delay: revealDelay });
    tl.to(tileRef.current, { rotateX: 90, duration: 0.22, ease: "power2.in" });
    tl.call(() => setShowFeedback(true));
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

  // Pop animation when a new letter is typed
  useEffect(() => {
    if (letter && letter !== prevLetter.current && tileRef.current) {
      gsap.fromTo(tileRef.current, { scale: 1.1 }, { scale: 1, duration: 0.1, ease: "power2.out" });
    }
    prevLetter.current = letter;
  }, [letter]);

  let className = "tile";
  if (!letter) {
    className += " tile-empty";
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
