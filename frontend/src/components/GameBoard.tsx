import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import { Game } from "@/types/game";
import { LetterFeedback } from "@/types/letter";
import Tile from "./Tile";

interface GameBoardProps {
  game: Game;
  currentGuess: string[];
  shakeState: { row: number; id: number } | null;
  revealRow: number | null;
  bouncing: boolean;
}

export interface GameBoardHandle {
  deconstruct(onComplete: () => void): void;
  triggerLose(): void;
}

const ROWS = 6;
const COLS = 5;

interface RowData {
  letters: (string | undefined)[];
  feedbacks: (LetterFeedback | undefined)[];
  isRevealing: boolean;
  shakeId: number | null;
  isBouncing: boolean;
  cursorCol?: number;
}

function GameRow({ letters, feedbacks, isRevealing, shakeId, isBouncing, cursorCol }: RowData) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shakeId || !rowRef.current) return;
    gsap.killTweensOf(rowRef.current);
    gsap.fromTo(
      rowRef.current,
      { x: 0 },
      {
        x: 8,
        duration: 0.07,
        repeat: 5,
        yoyo: true,
        ease: "none",
        onComplete: () => {
          if (rowRef.current) gsap.set(rowRef.current, { x: 0 });
        },
      }
    );
  }, [shakeId]);

  return (
    <div ref={rowRef} className="game-row">
      {Array.from({ length: COLS }).map((_, i) => (
        <Tile
          key={i}
          letter={letters[i]}
          feedback={feedbacks[i]}
          isRevealing={isRevealing}
          revealDelay={i * 0.11}
          isBouncing={isBouncing}
          bounceDelay={i * 0.07}
          isCursor={i === cursorCol}
        />
      ))}
    </div>
  );
}

const GameBoard = forwardRef<GameBoardHandle, GameBoardProps>(function GameBoard(
  { game, currentGuess, shakeState, revealRow, bouncing },
  ref
) {
  const boardRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    deconstruct(onComplete) {
      if (!boardRef.current) { onComplete(); return; }
      const tiles = boardRef.current.querySelectorAll(".tile");
      gsap.to(tiles, {
        rotateY: 90, opacity: 0, duration: 0.25, ease: "power2.in",
        stagger: { amount: 0.55, from: "end" }, onComplete,
      });
    },
    triggerLose() {
      if (!boardRef.current) return;
      const board = boardRef.current;
      const tl = gsap.timeline();
      tl.to(board, { x: 14, duration: 0.06, ease: "none" });
      tl.to(board, { x: -14, duration: 0.06, ease: "none" });
      tl.to(board, { x: 10, duration: 0.06, ease: "none" });
      tl.to(board, { x: -10, duration: 0.06, ease: "none" });
      tl.to(board, { x: 0, duration: 0.06, ease: "none" });
      const tiles = board.querySelectorAll(".tile");
      tl.to(tiles, { opacity: 0.35, duration: 0.35, stagger: { amount: 0.5, from: "random" } }, "+=0.1");
      tl.to(tiles, { opacity: 1, duration: 0.35, stagger: { amount: 0.5, from: "random" } });
    },
  }));

  // Entry animation on mount
  useEffect(() => {
    if (!boardRef.current) return;
    const tiles = boardRef.current.querySelectorAll(".tile");
    gsap.set(tiles, { rotateY: -90, opacity: 0 });
    gsap.to(tiles, {
      rotateY: 0,
      opacity: 1,
      duration: 0.38,
      ease: "power3.out",
      stagger: { amount: 0.9, from: "start" },
    });
  }, []);

  const rows: RowData[] = Array.from({ length: ROWS }, (_, rowIndex) => {
    const tryData = game.tries[rowIndex];
    const isCurrentRow =
      rowIndex === game.tries.length && game.status === "PLAYING";

    if (tryData) {
      const isWinRow =
        bouncing &&
        game.status === "WIN" &&
        rowIndex === game.tries.length - 1;
      return {
        letters: tryData.word.map((l) => l.letter),
        feedbacks: tryData.word.map((l) => l.feedback),
        isRevealing: revealRow === rowIndex,
        shakeId: null,
        isBouncing: isWinRow,
      };
    }

    if (isCurrentRow) {
      return {
        letters: Array.from({ length: COLS }, (_, i) => currentGuess[i]),
        feedbacks: Array.from({ length: COLS }, () => undefined),
        isRevealing: false,
        shakeId: shakeState?.row === rowIndex ? shakeState.id : null,
        isBouncing: false,
        cursorCol: currentGuess.length < COLS ? currentGuess.length : undefined,
      };
    }

    return {
      letters: Array.from({ length: COLS }, () => undefined),
      feedbacks: Array.from({ length: COLS }, () => undefined),
      isRevealing: false,
      shakeId: null,
      isBouncing: false,
    };
  });

  return (
    <div ref={boardRef} className="game-board">
      {rows.map((row, i) => (
        <GameRow key={i} {...row} />
      ))}
    </div>
  );
});

export default GameBoard;
