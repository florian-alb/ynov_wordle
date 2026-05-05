import { Word } from "@/types";
import { WORD_LIST } from "@/data/wordList";

export interface WordProvider {
  getNewWord(): Promise<Word>;
}

export class DictWordProvider implements WordProvider {
  async getNewWord(): Promise<Word> {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    return WORD_LIST[randomIndex];
  }
}

export class FakeWordProvider implements WordProvider {
  constructor(private readonly word: Word) {}

  async getNewWord(): Promise<Word> {
    return this.word;
  }
}

export class FailingWordProvider implements WordProvider {
  async getNewWord(): Promise<Word> {
    throw new Error("Failed to fetch word");
  }
}
