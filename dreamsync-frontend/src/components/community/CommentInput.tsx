import { useEffect, useRef, useState } from "react";

type Props = {
  disabled?: boolean;
  onSubmit: (value: string) => Promise<void> | void;
};

export default function CommentInput({ disabled, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || submitting || disabled) return;

    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue("");
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 border-t border-black/5 px-5 py-4">
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void handleSubmit();
          }
        }}
        placeholder="Write a gentle thought..."
        className="flex-1 rounded-full border border-black/10 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-900/20 focus:bg-white"
      />
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={disabled || submitting || value.trim().length === 0}
        className="rounded-full bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {submitting ? "Posting..." : "Post"}
      </button>
    </div>
  );
}
