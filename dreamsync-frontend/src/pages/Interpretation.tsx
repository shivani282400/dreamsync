import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  createDreamReflection,
  deleteDreamReflection,
  getDreamById,
  getDreamReflections,
  interpretDream,
  updateDreamReflection,
} from "../lib/apiClient";
import type { Dream, DreamReflection } from "../lib/apiClient";

export default function Interpretation() {
  const { dreamId } = useParams();
  const [dream, setDream] = useState<Dream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflections, setReflections] = useState<DreamReflection[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  useEffect(() => {
    if (!dreamId) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        let fetched = await getDreamById(dreamId);

        if (!fetched.dream?.interpretation) {
          await interpretDream(dreamId);
          fetched = await getDreamById(dreamId);
        }

        setDream(fetched.dream);

        try {
          const existingReflections = await getDreamReflections(dreamId);
          setReflections(existingReflections);
        } catch {
          setReflections([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dream.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [dreamId]);

  const reflectionMap = useMemo(() => {
    const map = new Map<string, DreamReflection>();
    for (const reflection of reflections) {
      map.set(reflection.question, reflection);
    }
    return map;
  }, [reflections]);

  async function handleSaveReflection(index: number, question: string) {
    if (!dreamId) return;
    const answer = answers[index]?.trim();
    if (!answer) return;

    setSaving((prev) => ({ ...prev, [String(index)]: true }));

    try {
      const saved = await createDreamReflection({
        dreamId,
        question,
        answer,
      });

      setReflections((prev) => [...prev, saved]);
      setAnswers((prev) => ({ ...prev, [index]: "" }));
    } finally {
      setSaving((prev) => ({ ...prev, [String(index)]: false }));
    }
  }

  async function handleUpdateReflection(reflection: DreamReflection) {
    const next = editingText.trim();
    if (!next) return;

    setSaving((prev) => ({ ...prev, [reflection.id]: true }));

    try {
      const updated = await updateDreamReflection(reflection.id, next);

      setReflections((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setEditingId(null);
      setEditingText("");
    } finally {
      setSaving((prev) => ({ ...prev, [reflection.id]: false }));
    }
  }

  async function handleDeleteReflection(reflection: DreamReflection) {
    setSaving((prev) => ({ ...prev, [reflection.id]: true }));

    try {
      await deleteDreamReflection(reflection.id);

      setReflections((prev) =>
        prev.filter((item) => item.id !== reflection.id)
      );
    } finally {
      setSaving((prev) => ({ ...prev, [reflection.id]: false }));
    }
  }

  if (loading) {
    return <div className="p-10 text-white/60">Interpreting your dream…</div>;
  }

  if (error) {
    return <div className="p-10 text-white/60">{error}</div>;
  }

  if (!dream) {
    return <div className="p-10 text-white/60">Dream not found.</div>;
  }

  const interpretation = dream.interpretation?.content as {
    summary?: string;
    themes?: string[];
    emotionalTone?: string;
    reflectionPrompts?: string[];
    symbolTags?: string[];
    wordReflections?: { word: string; reflection: string }[];
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
      <h1 className="text-2xl font-light text-white/90 tracking-wide">
        A Gentle Reflection
      </h1>

      {/* Dream Content */}
      <div className="space-y-3">
        <p className="text-white/40 text-xs uppercase tracking-widest">
          Your Dream
        </p>
        <p className="text-white/80 leading-relaxed text-base">
          {dream.content}
        </p>
      </div>

      {/* Interpretation Summary */}
      <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-white/40 text-xs uppercase tracking-widest">
          Reflection
        </p>

        <p className="text-white/80 leading-relaxed text-base">
          {interpretation?.summary || "Your reflection is still forming..."}
        </p>

        {interpretation?.emotionalTone && (
          <div className="pt-2">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
              Emotional Tone
            </p>
            <p className="text-white/70 text-sm">
              {interpretation.emotionalTone}
            </p>
          </div>
        )}
      </div>

      {/* Symbol Tags */}
      {interpretation?.symbolTags?.length ? (
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
            Symbols & Themes
          </p>
          <div className="flex flex-wrap gap-2">
            {interpretation.symbolTags.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/70 border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Reflection Prompts */}
      {interpretation?.reflectionPrompts?.length ? (
        <div className="space-y-4">
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Questions to Sit With
          </p>

          <div className="space-y-4">
            {interpretation.reflectionPrompts.map((question, i) => {
              const existing = reflectionMap.get(question);

              return (
                <div
                  key={`${question}-${i}`}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
                >
                  <div className="text-white/80 text-sm leading-relaxed">
                    {question}
                  </div>

                  {existing ? (
                    editingId === existing.id ? (
                      <>
                        <textarea
                          value={editingText}
                          onChange={(e) =>
                            setEditingText(e.target.value)
                          }
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateReflection(existing)
                            }
                            disabled={
                              saving[existing.id] ||
                              !editingText.trim()
                            }
                            className="px-4 py-2 rounded-full text-xs text-white/80 border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                          >
                            {saving[existing.id]
                              ? "Saving..."
                              : "Update"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingText("");
                            }}
                            className="px-4 py-2 rounded-full text-xs text-white/50 border border-white/10 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-white/60 text-sm">
                          {existing.answer}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(existing.id);
                              setEditingText(existing.answer);
                            }}
                            className="px-3 py-1 rounded-full text-xs text-white/70 border border-white/10 hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteReflection(existing)
                            }
                            disabled={saving[existing.id]}
                            className="px-3 py-1 rounded-full text-xs text-white/50 border border-white/10 hover:bg-white/10"
                          >
                            {saving[existing.id]
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </>
                    )
                  ) : (
                    <>
                      <textarea
                        value={answers[i] ?? ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [i]: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Write your reflection..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20"
                      />
                      <button
                        onClick={() =>
                          handleSaveReflection(i, question)
                        }
                        disabled={
                          saving[String(i)] ||
                          !(answers[i] ?? "").trim()
                        }
                        className="px-4 py-2 rounded-full text-xs text-white/80 border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                      >
                        {saving[String(i)]
                          ? "Saving..."
                          : "Save Reflection"}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
