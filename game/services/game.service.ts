import { Game } from "@/types";
import { WordProvider } from "@/services/wordProvider";
import { compareWord, createWord, isWin, isWordValid } from "@/rules/gameUtils";
import { InvalidApiError } from "@/exceptions/apiExceptions";
import {
  InvalidWordError,
  NoGameInProgressError,
  WordNotInDictionaryError,
} from "@/exceptions/gameExceptions";

export class GameService {
  constructor(private readonly wordProvider: WordProvider) {}
  private game: Game | null = null;

  async newGame(): Promise<void> {
    try {
      const word = await this.wordProvider.getNewWord();
      createWord(word);
      this.game = { word, tries: [], status: "PLAYING" };
    } catch (error) {
      if (error instanceof InvalidWordError) {
        throw error;
      }
      throw new InvalidApiError(error);
    }
  }

  getGame(): Game | null {
    return this.game;
  }

  try(word: string): void {
    if (!this.game || this.game.status !== "PLAYING") {
      throw new NoGameInProgressError(this.game?.status);
    }

    try {
      const validWord = createWord(word);
      if (!isWordValid(validWord)) {
        throw new WordNotInDictionaryError(word);
      }
      const tryResult = compareWord(validWord, this.game.word);
      this.game.tries.push(tryResult);

      if (isWin(tryResult)) {
        this.game.status = "WIN";
      } else if (this.game.tries.length >= 6) {
        this.game.status = "LOSE";
      }
    } catch (error) {
      throw error;
    }
  }
}
