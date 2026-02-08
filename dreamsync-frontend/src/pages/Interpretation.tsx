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
    const id = dreamId;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        let fetched = await getDreamById(id);
        if (!fetched.dream?.interpretation) {
          await interpretDream(id);
          fetched = await getDreamById(id);
        }
        setDream(fetched.dream);

        try {
          const existingReflections = await getDreamReflections(id);
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
    const id = dreamId;
    const answer = answers[index]?.trim();
    if (!answer) return;

    setSaving((prev) => ({ ...prev, [String(index)]: true }));
    try {
      const saved = await createDreamReflection({
        dreamId: id,
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
    return (
      <div className="p-10 text-white/60">
        Interpreting your dream…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-white/60">
        {error}
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="p-10 text-white/60">
        Dream not found.
      </div>
    );
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
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl text-white/90">
        Dream Interpretation
      </h1>

      <div className="space-y-3">
        <p className="text-white/40 text-xs uppercase tracking-wide">
          Dream
        </p>
        <p className="text-white/80 leading-relaxed">
          {dream.content}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-white/40 text-xs uppercase tracking-wide">
          Interpretation
        </p>
        <p className="text-white/70 leading-relaxed">
          {interpretation?.summary || "Interpretation pending."}
        </p>
      </div>

      {Array.isArray(interpretation?.symbolTags) &&
        interpretation.symbolTags.length > 0 && (
          <div>
            <h3 className="text-white/80 mt-6 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {interpretation.symbolTags.map((tag: string, i: number) => (
                <span
                  key={`${tag}-${i}`}
                  className="px-3 py-1 rounded-full text-xs
                             bg-white/5 text-white/80
                             border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

      <div>
        <h3 className="text-white/80 mt-6 mb-2">Reflection</h3>
        <ul className="space-y-2 text-white/60">
          {(interpretation?.reflectionPrompts ?? []).map((p: string, i: number) => (
            <li key={i}>• {p}</li>
          ))}
        </ul>
      </div>

      {Array.isArray(interpretation?.reflectionPrompts) &&
        interpretation.reflectionPrompts.length > 0 && (
          <div>
            <h3 className="text-white/80 mt-6 mb-2">
              Your Reflections
            </h3>
            <div className="space-y-4">
              {interpretation.reflectionPrompts.map(
                (question: string, i: number) => {
                  const existing = reflectionMap.get(question);
                  return (
                    <div
                      key={`${question}-${i}`}
                      className="bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                      <div className="text-sm text-white/80 mb-2">
                        {question}
                      </div>
                      {existing ? (
                        <div className="space-y-3">
                          {editingId === existing.id ? (
                            <>
                              <textarea
                                value={editingText}
                                onChange={(e) =>
                                  setEditingText(e.target.value)
                                }
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
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
                                  {saving[existing.id] ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
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
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
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
                            {saving[String(i)] ? "Saving..." : "Save Reflection"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

      {reflections.length > 0 && (
        <div>
          <h3 className="text-white/80 mt-6 mb-2">
            Reflection Archive
          </h3>
          <div className="space-y-3 text-white/60">
            {reflections.map((r) => (
              <div
                key={r.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="text-sm text-white/70 mb-1">
                  {r.question}
                </div>
                {editingId === r.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateReflection(r)}
                        disabled={
                          saving[r.id] || !editingText.trim()
                        }
                        className="px-4 py-2 rounded-full text-xs text-white/80 border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40"
                      >
                        {saving[r.id] ? "Saving..." : "Update"}
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
                  </div>
                ) : (
                  <>
                    <div className="text-sm">{r.answer}</div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingId(r.id);
                          setEditingText(r.answer);
                        }}
                        className="px-3 py-1 rounded-full text-xs text-white/70 border border-white/10 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReflection(r)}
                        disabled={saving[r.id]}
                        className="px-3 py-1 rounded-full text-xs text-white/50 border border-white/10 hover:bg-white/10"
                      >
                        {saving[r.id] ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(interpretation?.wordReflections) &&
        interpretation.wordReflections.length > 0 && (
          <div>
            <h3 className="text-white/80 mt-6 mb-2">
              Word Reflections
            </h3>
            <div className="space-y-3 text-white/60">
              {interpretation.wordReflections.map(
                (
                  item: { word: string; reflection: string },
                  i: number
                ) => (
                  <div
                    key={`${item.word}-${i}`}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="text-white/80 text-sm mb-1">
                      {item.word}
                    </div>
                    <div className="text-sm">
                      {item.reflection}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}
