import { useEffect, useRef } from "react";
import gsap from "gsap";
import { LetterFeedback } from "@/types/letter";

const LAYOUT = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["⮑", "W", "X", "C", "V", "B", "N", "⌫"],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: Record<string, LetterFeedback>;
  disabled: boolean;
}

interface KeyProps {
  label: string;
  state?: LetterFeedback;
  onPress: () => void;
  disabled: boolean;
}

function Key({ label, state, onPress, disabled }: KeyProps) {
  const keyRef = useRef<HTMLButtonElement>(null);
  const isWide = label === "⮑" || label === "⌫";
  const prevState = useRef<LetterFeedback | undefined>(undefined);

  useEffect(() => {
    if (state && state !== prevState.current && keyRef.current) {
      gsap.fromTo(keyRef.current, { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    }
    prevState.current = state;
  }, [state]);

  function handleClick() {
    if (disabled) return;
    onPress();
    if (keyRef.current) {
      gsap.fromTo(
        keyRef.current,
        { scale: 0.88 },
        { scale: 1, duration: 0.15, ease: "back.out(2)" },
      );
    }
  }

  const stateClass = state ? ` key-${state.toLowerCase()}` : "";
  const wideClass = isWide ? " key-wide" : "";

  return (
    <button
      ref={keyRef}
      className={`key${wideClass}${stateClass}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export default function Keyboard({
  onKeyPress,
  letterStates,
  disabled,
}: KeyboardProps) {
  function toKeyValue(label: string): string {
    if (label === "ENTRÉE") return "ENTER";
    if (label === "⌫") return "BACKSPACE";
    return label.toLowerCase();
  }

  return (
    <div className="keyboard">
      {LAYOUT.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key) => (
            <Key
              key={key}
              label={key}
              state={letterStates[key.toLowerCase()]}
              onPress={() => onKeyPress(toKeyValue(key))}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
