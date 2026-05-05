import { InvalidWordError } from "@/exceptions/gameExceptions";
import { Word, Try, Letter } from "@/types";

export function createWord(str: string): Word {
  if (!/^[a-z]{5}$/i.test(str)) {
    throw new InvalidWordError(str);
  }
  return str.toLowerCase() as Word;
}

export function compareWord(tried: Word, wordToFind: Word): Try {
  const wordToFindWthoutFoundLetters = wordToFind.split("");
  const triedLetters = tried.toLowerCase().split("");

  const tryMap: Letter[] = triedLetters.map((letter, index) => {
    const letterIndexes = findAllIndexes(wordToFind, letter);
    if (letterIndexes.includes(index)) {
      wordToFindWthoutFoundLetters[index] = "";
      triedLetters[index] = "_";
      return { letter, feedback: "CORRECT" };
    }
    return { letter, feedback: "ABSENT" };
  });

  triedLetters.forEach((letter, index) => {
    if (wordToFindWthoutFoundLetters.includes(letter)) {
      tryMap[index] = { letter, feedback: "MISPLACED" };
      const foudnIndex = wordToFindWthoutFoundLetters.indexOf(letter);
      wordToFindWthoutFoundLetters.splice(foudnIndex, 1);
    }
  });

  return { word: tryMap };
}

function findAllIndexes(word: string, letter: string): number[] {
  const result: number[] = [];

  for (let i = 0; i < word.length; i++) {
    if (word[i] === letter) {
      result.push(i);
    }
  }
  return result;
}

export function isWin(wordTry: Try) {
  return wordTry.word.every((letter) => letter.feedback === "CORRECT");
}
