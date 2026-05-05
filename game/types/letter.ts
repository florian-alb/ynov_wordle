type Letter = {
  letter: string;
  feedback: LetterFeedback;
};

type LetterFeedback = "CORRECT" | "MISPLACED" | "ABSENT";

export type { Letter, LetterFeedback };
