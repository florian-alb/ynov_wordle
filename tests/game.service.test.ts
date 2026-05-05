import { beforeEach, describe, expect, it } from "vitest";
import { GameService } from "@/services/game.service";
import { Word } from "@/types";
import {
  FailingWordProvider,
  FakeWordProvider,
  WordProvider,
} from "@/services/wordProvider";
import { InvalidApiError } from "@/exceptions/apiExceptions";
import {
  InvalidWordError,
  NoGameInProgressError,
  WordNotInDictionaryError,
} from "@/exceptions/gameExceptions";

describe("GameService", () => {
  describe("Starting a new game", () => {
    it("should start a new game in PLAYING status with no prior guesses", async () => {
      // arrange
      const stubWordProvider: WordProvider = new FakeWordProvider(
        "salut" as Word,
      );
      const gameService = new GameService(stubWordProvider);

      // act
      await gameService.newGame();
      const game = gameService.getGame();

      // assert
      expect(game).not.toBeNull();
      expect(game?.word).toBe("salut");
      expect(game?.tries).toEqual([]);
      expect(game?.status).toBe("PLAYING");
    });

    it("should prevent starting a game when the word provider returns an invalid word", async () => {
      // arrange
      const stubWordProvider: WordProvider = new FakeWordProvider(
        "sucré" as Word,
      );
      const gameService = new GameService(stubWordProvider);

      // act
      const result = () => gameService.newGame();

      // assert
      await expect(result).rejects.toThrow(InvalidWordError);
    });

    it("should prevent starting a game when the word provider is unavailable", async () => {
      // arrange
      const failingWordProvider: WordProvider = new FailingWordProvider();
      const gameService = new GameService(failingWordProvider);

      // act
      const result = () => gameService.newGame();

      // assert
      await expect(result).rejects.toThrow(InvalidApiError);
    });
  });

  describe("Submitting a guess", () => {
    let gameService: GameService;

    beforeEach(async () => {
      const stubWordProvider: WordProvider = new FakeWordProvider(
        "salut" as Word,
      );
      gameService = new GameService(stubWordProvider);
      await gameService.newGame();
    });

    it("should record each submitted guess", async () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      gameService.try("rouge");
      const game = gameService.getGame();

      // assert
      expect(game?.tries.length).toBe(1);
    });

    it("should end the game as won when the correct word is guessed", async () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      gameService.try("salut");
      const game = gameService.getGame();

      // assert
      expect(game?.status).toBe("WIN");
    });

    it("should end the game as lost after 6 incorrect guesses", async () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      for (let i = 0; i < 6; i++) {
        gameService.try("rouge");
      }
      const game = gameService.getGame();

      // assert
      expect(game?.status).toBe("LOSE");
    });

    it("should reject further guesses once the game is already won", async () => {
      // arrange
      gameService.try("salut");

      // act
      const result = () => gameService.try("rouge");

      // assert
      expect(result).toThrow(NoGameInProgressError);
    });

    it("should reject a guess that is not a valid 5-letter word", async () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      const result = () => gameService.try("saluttt");

      // assert
      expect(result).toThrow(InvalidWordError);
    });

    it("should reject a guess that is not in the dictionary", () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      const result = () => gameService.try("saluo");

      // assert
      expect(result).toThrow(WordNotInDictionaryError);
    });

    it("should reject a guess when no game has been started", () => {
      // arrange
      const stubWordProvider = {
        getNewWord: async () => "salut" as Word,
      };
      const gameService = new GameService(stubWordProvider);

      // act
      const result = () => gameService.try("salut");

      // assert
      expect(result).toThrow(NoGameInProgressError);
    });
  });
});
