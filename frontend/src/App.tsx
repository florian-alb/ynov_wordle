import { GameService } from "@/services/game.service";
import { DictWordProvider } from "@/services/wordProvider";
import { Game } from "@/types/game";
import { LetterFeedback } from "@/types/letter";
import { useCallback, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
import GameBoard, { type GameBoardHandle } from "./components/GameBoard";
import Keyboard from "./components/Keyboard";

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
  const [shakeState, setShakeState] = useState<{ row: number; id: number } | null>(null);
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef<GameBoardHandle>(null);

  async function startNewGame() {
    // Fetch next word and deconstruct animation run in parallel
    const gameReady = gameService.newGame();
    const animated = game
      ? new Promise<void>((resolve) => boardRef.current?.deconstruct(resolve) ?? resolve())
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
            setTimeout(() => setBouncing(true), 1900);
            setTimeout(
              () => toast.success("Bravo ! 🎉", { duration: 3000 }),
              2100
            );
          } else if (newGame.status === "LOSE") {
            setTimeout(
              () =>
                toast.error(
                  `Le mot était : ${newGame.word.toUpperCase()}`,
                  { duration: 5000 }
                ),
              2200
            );
          }

          setGame(newGame);
          setCurrentGuess([]);
        } catch (error) {
          setShakeState({ row: game.tries.length, id: Date.now() });
          toast.error(
            error instanceof Error ? error.message : "Erreur inconnue"
          );
        }
        return;
      }

      if (currentGuess.length < 5 && /^[a-zA-Z]$/.test(key)) {
        setCurrentGuess((prev) => [...prev, key.toLowerCase()]);
      }
    },
    [game, currentGuess, gameService]
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

  return (
    <div className="app">
      <Toaster
        position="top-center"
        toastOptions={{
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
        <h1 className="title">WORDLE</h1>
      </header>

      <main className="main">
        {!game ? (
          <div className="start-screen">
            <p className="subtitle">Devinez le mot de 5 lettres en 6 essais</p>
            <button className="btn-primary" onClick={startNewGame}>
              Nouvelle Partie
            </button>
          </div>
        ) : (
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
    </div>
  );
}
