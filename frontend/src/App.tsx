import { GameService } from "@/services/game.service";
import { DictWordProvider } from "@/services/wordProvider";
import { Game } from "@/types/game";
import { useRef, useState } from "react";
import "./App.css";

function displayPlaceHolder(iterations: number) {
  if (iterations < 0) return;

  return (
    <>
      {Array.from({ length: iterations }).map((_, index) => (
        <div key={index} className="flex grid">
          <p className="letter"></p>
          <p className="letter"></p>
          <p className="letter"></p>
          <p className="letter"></p>
          <p className="letter"></p>
        </div>
      ))}
    </>
  );
}

function getTriesLeft(game: Game) {
  if (!game) return 6;
  return 6 - game.tries.length;
}

function gameGrid(game: Game, onSubmit) {
  return (
    <div>
      {game?.tries.map((wordleTry, index) => (
        <div className="flex grid">
          {wordleTry.word.map((l) => (
            <p key={index} className={`letter ${l.feedback.toLowerCase()}`}>
              {l.letter.toLocaleUpperCase()}
            </p>
          ))}
        </div>
      ))}

      {displayPlaceHolder(getTriesLeft(game))}

      <form action={onSubmit}>
        <input type="text" name="try" disabled={game?.status !== "PLAYING"} />
        <input
          type="submit"
          value="Submit"
          disabled={game?.status !== "PLAYING"}
        />
      </form>
    </div>
  );
}

export default function App() {
  const gameServiceRef = useRef(new GameService(new DictWordProvider()));
  const gameService = gameServiceRef.current;

  const [game, setGame] = useState<Game | null>(null);

  async function startNewGame() {
    await gameService.newGame();
    setGame(gameService.getGame());
  }

  function submitTry(formData: FormData) {
    const input = formData.get("try");
    try {
      gameService.try(input as string);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setGame({ ...gameService.getGame() });
    }
  }

  return (
    <section>
      <h1>Wordle</h1>
      <p>{game?.status || "No game in progress"}</p>
      {game && gameGrid(game, submitTry)}

      {game?.status !== "PLAYING" && (
        <button onClick={startNewGame}>New Game</button>
      )}

      {game?.status === "LOSE" && <p>{game.word}</p>}
    </section>
  );
}
