import { GameService } from "@/services/game.service";
import { DictWordProvider } from "@/services/wordProvider";
import { Game } from "@/types/game";
import { LetterFeedback } from "@/types/letter";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { spawnWinConfetti } from "./utils/particles";
import { spawnLoseFlames } from "./utils/flames";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
import GameBoard, { type GameBoardHandle } from "./components/GameBoard";
import Keyboard from "./components/Keyboard";
import DebugPanel from "./components/DebugPanel";
import EasterEgg from "./components/EasterEgg";

const PRIORITY: Record<LetterFeedback, number> = {
  CORRECT: 3,
  MISPLACED: 2,
  ABSENT: 1,
};

function getLetterStates(game: Game): Record<string, LetterFeedback> {
  const states: Record<string, LetterFeedback> = {};
  for (const tryObj of game.tries) {
    for (const { letter, feedback } of tryObj.word) {
      const l = letter.toLowerCase();
      if (!states[l] || PRIORITY[feedback] > PRIORITY[states[l]]) {
        states[l] = feedback;
      }
    }
  }
  return states;
}

export default function App() {
  const gameServiceRef = useRef(new GameService(new DictWordProvider()));
  const gameService = gameServiceRef.current;

  const [game, setGame] = useState<Game | null>(null);
  const [boardKey, setBoardKey] = useState(0);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [shakeState, setShakeState] = useState<{
    row: number;
    id: number;
  } | null>(null);
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef<GameBoardHandle>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    const letters = titleRef.current.querySelectorAll("span");
    if (game?.status === "WIN") {
      gsap.fromTo(
        letters,
        { y: 0, color: "#ffffff" },
        {
          y: -14,
          color: "#538d4e",
          duration: 0.2,
          stagger: 0.07,
          yoyo: true,
          repeat: 3,
          ease: "power2.out",
        },
      );
    } else if (game?.status === "LOSE") {
      gsap.fromTo(
        letters,
        { y: 0, color: "#ffffff" },
        {
          y: 4,
          color: "#b59f3b",
          duration: 0.15,
          stagger: 0.05,
          yoyo: true,
          repeat: 3,
          ease: "power2.inOut",
        },
      );
    }
  }, [game?.status]);

  async function startNewGame() {
    // Fetch next word and deconstruct animation run in parallel
    const gameReady = gameService.newGame();
    const animated = game
      ? new Promise<void>(
          (resolve) => boardRef.current?.deconstruct(resolve) ?? resolve(),
        )
      : Promise.resolve();

    await Promise.all([gameReady, animated]);

    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    setGame({ ...gameService.getGame()! });
    setBoardKey((k) => k + 1);
    setCurrentGuess([]);
    setBouncing(false);
    setShakeState(null);
    setRevealRow(null);
  }

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!game || game.status !== "PLAYING") return;

      if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (key === "ENTER") {
        if (currentGuess.length !== 5) {
          setShakeState({ row: game.tries.length, id: Date.now() });
          toast("Mot trop court", { icon: "⚠️" });
          return;
        }

        const word = currentGuess.join("");
        try {
          gameService.try(word);
          const newGame: Game = { ...gameService.getGame()! };
          const rowIndex = newGame.tries.length - 1;

          if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
          setRevealRow(rowIndex);
          revealTimerRef.current = setTimeout(() => setRevealRow(null), 2200);

          if (newGame.status === "WIN") {
            if (newGame.tries.length <= 3) {
              setTimeout(() => setEasterEgg(true), 2600);
            }
            setTimeout(() => {
              setBouncing(true);
              const board = document.querySelector(".game-board");
              if (board) {
                const rect = board.getBoundingClientRect();
                spawnWinConfetti(
                  rect.left + rect.width / 2,
                  rect.top + rect.height / 2,
                );
              }
            }, 1900);
            setTimeout(
              () => toast.success("Bravo ! 🎉", { duration: 4000 }),
              2100,
            );
          } else if (newGame.status === "LOSE") {
            setTimeout(() => {
              boardRef.current?.triggerLose();
              const board = document.querySelector(".game-board");
              if (board) {
                const rect = board.getBoundingClientRect();
                spawnLoseFlames(rect.left, rect.bottom, rect.width);
              }
              toast.error(`Le mot était : ${newGame.word.toUpperCase()}`, {
                duration: 5000,
              });
            }, 2200);
          }

          setGame(newGame);
          setCurrentGuess([]);
        } catch (error) {
          setShakeState({ row: game.tries.length, id: Date.now() });
          toast.error(
            error instanceof Error ? error.message : "Erreur inconnue",
          );
        }
        return;
      }

      if (currentGuess.length < 5 && /^[a-zA-Z]$/.test(key)) {
        setCurrentGuess((prev) => [...prev, key.toLowerCase()]);
      }
    },
    [game, currentGuess, gameService],
  );

  // Keep a stable ref so the keydown listener always has the latest handler
  const handleKeyPressRef = useRef(handleKeyPress);
  useEffect(() => {
    handleKeyPressRef.current = handleKeyPress;
  }, [handleKeyPress]);

  // Physical keyboard support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") handleKeyPressRef.current("ENTER");
      else if (e.key === "Backspace") handleKeyPressRef.current("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key))
        handleKeyPressRef.current(e.key.toLowerCase());
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Auto-start a game on mount
  useEffect(() => {
    if (!game) {
      startNewGame();
    }
  }, [game]);

  return (
    <div className="app">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#1a1a1b",
            color: "#ffffff",
            fontWeight: 700,
            border: "1px solid #3a3a3c",
            fontFamily: "inherit",
            borderRadius: "6px",
          },
        }}
      />

      <header className="header">
        <h1 className="title" ref={titleRef}>
          {"WORDLE".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </h1>
      </header>

      <main className="main">
        {game && (
          <>
            <GameBoard
              key={boardKey}
              ref={boardRef}
              game={game}
              currentGuess={currentGuess}
              shakeState={shakeState}
              revealRow={revealRow}
              bouncing={bouncing}
            />
            <Keyboard
              onKeyPress={handleKeyPress}
              letterStates={getLetterStates(game)}
              disabled={game.status !== "PLAYING"}
            />
            {game.status !== "PLAYING" && (
              <button className="btn-primary" onClick={startNewGame}>
                Nouvelle Partie
              </button>
            )}
          </>
        )}
      </main>
      <DebugPanel />
      {easterEgg && <EasterEgg onDone={() => setEasterEgg(false)} />}
    </div>
  );
}
