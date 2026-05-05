import { Word } from "@/types";

export interface WordProvider {
  getNewWord(): Promise<Word>;
}

export class HttpWordProvider implements WordProvider {
  async getNewWord(): Promise<Word> {
    const response = await fetch("https://trouve-mot.fr/api/size/5");
    const data = await response.json();

    return data[0].name as Word;
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
