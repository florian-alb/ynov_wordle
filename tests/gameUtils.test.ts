import { InvalidWordError } from "@/exceptions/gameExceptions";
import { compareWord, createWord } from "@/rules/gameUtils";
import { Word } from "@/types/word";
import { describe, expect, it } from "vitest";

describe("Game rules", () => {
  describe("createWord", () => {
    it("should consider a word valid only if it has exactly 5 letters", async () => {
      // arrange
      const word = "salut";
      // act
      const result = createWord(word);
      // assert
      expect(result).toBe("salut");
    });

    it("should consider a word invalid if it contains more or less than 5 letters", async () => {
      // arrange
      const word = "word";
      // act
      const result = () => createWord(word);
      // assert
      expect(result).toThrow(InvalidWordError);
    });

    it("should consider a word invalid if it contains accents", async () => {
      // arrange
      const word = "salût";
      // act
      const result = () => createWord(word);
      // assert
      expect(result).toThrow(InvalidWordError);
    });

    it("should consider a word invalid if it contains special characters", async () => {
      // arrange
      const word = "salut!";
      // act
      const result = () => createWord(word);
      // assert
      expect(result).toThrow(InvalidWordError);
    });

    it("should consider a word invalid if it contains numbers", async () => {
      // arrange
      const word = "salut1";
      // act
      const result = () => createWord(word);
      // assert
      expect(result).toThrow(InvalidWordError);
    });
  });

  describe("compareWord", () => {
    it("should mark letter as CORRECT when it matches the same position", () => {
      // arrange
      const input = "salut" as Word;
      const toFind = "segij" as Word;
      // act
      const result = compareWord(input, toFind);
      // assert
      expect(result).toEqual({
        word: [
          { letter: "s", feedback: "CORRECT" },
          { letter: "a", feedback: "ABSENT" },
          { letter: "l", feedback: "ABSENT" },
          { letter: "u", feedback: "ABSENT" },
          { letter: "t", feedback: "ABSENT" },
        ],
      });
    });

    it("should mark letter as MISPLACED when it exists in the word but at a different position", () => {
      // arrange
      const input = "salut" as Word;
      const toFind = "rlimo" as Word;
      // act
      const result = compareWord(input, toFind);
      // assert
      expect(result).toEqual({
        word: [
          { letter: "s", feedback: "ABSENT" },
          { letter: "a", feedback: "ABSENT" },
          { letter: "l", feedback: "MISPLACED" },
          { letter: "u", feedback: "ABSENT" },
          { letter: "t", feedback: "ABSENT" },
        ],
      });
    });

    it("should mark letter as ABSENT when it does not exist in the word", () => {
      // arrange
      const input = "salut" as Word;
      const toFind = "saluo" as Word;
      // act
      const result = compareWord(input, toFind);
      // assert
      expect(result).toEqual({
        word: [
          { letter: "s", feedback: "CORRECT" },
          { letter: "a", feedback: "CORRECT" },
          { letter: "l", feedback: "CORRECT" },
          { letter: "u", feedback: "CORRECT" },
          { letter: "t", feedback: "ABSENT" },
        ],
      });
    });

    it("should mark all letters as CORRECT if the words are identical", () => {
      // arrange
      const input = "salut" as Word;
      const toFind = "salut" as Word;
      // act
      const result = compareWord(input, toFind);
      // assert
      expect(result).toEqual({
        word: [
          { letter: "s", feedback: "CORRECT" },
          { letter: "a", feedback: "CORRECT" },
          { letter: "l", feedback: "CORRECT" },
          { letter: "u", feedback: "CORRECT" },
          { letter: "t", feedback: "CORRECT" },
        ],
      });
    });

    it("should mark all letters as ABSENT if the words are completely different", () => {
      // arrange
      const input = "salut" as Word;
      const toFind = "zbcde" as Word;
      // act
      const result = compareWord(input, toFind);
      // assert
      expect(result).toEqual({
        word: [
          { letter: "s", feedback: "ABSENT" },
          { letter: "a", feedback: "ABSENT" },
          { letter: "l", feedback: "ABSENT" },
          { letter: "u", feedback: "ABSENT" },
          { letter: "t", feedback: "ABSENT" },
        ],
      });
    });

    it("should mark duplicate letter as ABSENT when the word only contains it once", () => {
      // arrange
      const input = "saltt" as Word;
      const toFind = "salut" as Word;
      // act
      const result = compareWord(input, toFind);
      // assert
      expect(result).toEqual({
        word: [
          { letter: "s", feedback: "CORRECT" },
          { letter: "a", feedback: "CORRECT" },
          { letter: "l", feedback: "CORRECT" },
          { letter: "t", feedback: "ABSENT" },
          { letter: "t", feedback: "CORRECT" },
        ],
      });
    });

    it("should mark duplicate letter as MISPLACED only as many times as it appears in the word", () => {
      // arrange
      const input = "stttt" as Word;
      const toFind = "tssss" as Word;
      // act
      const result = compareWord(input, toFind);
      // assert
      expect(result).toEqual({
        word: [
          { letter: "s", feedback: "MISPLACED" },
          { letter: "t", feedback: "MISPLACED" },
          { letter: "t", feedback: "ABSENT" },
          { letter: "t", feedback: "ABSENT" },
          { letter: "t", feedback: "ABSENT" },
        ],
      });
    });
  });
});
