import { Word, Try } from "@/types";

type GameStatus = "WIN" | "LOSE" | "PLAYING";

type Game = {
  word: Word;
  tries: Try[];
  status: GameStatus;
};

export type { Game, GameStatus };
