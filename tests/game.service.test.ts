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
} from "@/exceptions/gameExceptions";

describe("GameService", () => {
  describe("newGame", () => {
    it("should initialize game with word from provider", async () => {
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

    it("should throw error if the provider returns an invalid word", async () => {
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

    it("should throw error if the API call fails", async () => {
      // arrange
      const failingWordProvider: WordProvider = new FailingWordProvider();
      const gameService = new GameService(failingWordProvider);

      // act
      const result = () => gameService.newGame();

      // assert
      await expect(result).rejects.toThrow(InvalidApiError);
    });
  });

  describe("try", () => {
    let gameService: GameService;

    beforeEach(async () => {
      const stubWordProvider: WordProvider = new FakeWordProvider(
        "salut" as Word,
      );
      gameService = new GameService(stubWordProvider);
      await gameService.newGame();
    });

    it("should update tries when a try is made", async () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      gameService.try("saluo");
      const game = gameService.getGame();

      // assert
      expect(game?.tries.length).toBe(1);
    });

    it("should update status to WIN when a try is made correctly", async () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      gameService.try("salut");
      const game = gameService.getGame();

      // assert
      expect(game?.status).toBe("WIN");
    });

    it("should update status to LOSE after 6 incorrect tries", async () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      for (let i = 0; i < 6; i++) {
        gameService.try("saluo");
      }
      const game = gameService.getGame();

      // assert
      expect(game?.status).toBe("LOSE");
    });

    it("should not allow tries after game is won", async () => {
      // arrange
      gameService.try("salut");

      // act
      const result = () => gameService.try("saluo");

      // assert
      expect(result).toThrow(NoGameInProgressError);
    });

    it("should throw error if try is made with an invalid word", async () => {
      // arrange
      // nothing to arrange since beforeEach already initializes the game

      // act
      const result = () => gameService.try("saluttt");

      // assert
      expect(result).toThrow(InvalidWordError);
    });

    it("should throw error if try is made when no game in progress", () => {
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
