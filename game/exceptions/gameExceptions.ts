export class InvalidWordError extends Error {
  constructor(word: string) {
    super(`"${word}" is not a valid 5-letter word without accents.`);
    this.name = "InvalidWordError";
  }
}

export class WordNotInDictionaryError extends Error {
  constructor(word: string) {
    super(`"${word}" is not in the dictionary.`);
    this.name = "WordNotInDictionaryError";
  }
}

export class NoGameInProgressError extends Error {
  constructor(status?: string) {
    switch (status) {
      case "won":
        super("Game already won");
        break;
      case "lost":
        super("Game already lost");
        break;
      default:
        super("No game in progress");
    }
    this.name = "NoGameInProgressError";
  }
}
