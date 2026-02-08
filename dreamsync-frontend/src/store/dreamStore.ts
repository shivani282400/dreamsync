import { create } from "zustand";
import { getDreams, type Dream } from "../lib/apiClient";

type DreamState = {
  dreamText: string;
  mood: string | null;
  tags: string[];

  dreams: Dream[];
  loading: boolean;

  setDreamText: (text: string) => void;
  setMood: (mood: string) => void;
  toggleTag: (tag: string) => void;

  fetchDreams: () => Promise<void>;
  addDream: (dream: Dream) => void;
  setDreamShared: (dreamId: string, isShared: boolean) => void;
  resetForm: () => void;
};

export const useDreamStore = create<DreamState>((set) => ({
  dreamText: "",
  mood: null,
  tags: [],

  dreams: [],
  loading: false,

  setDreamText: (text) => set({ dreamText: text }),
  setMood: (mood) => set({ mood }),
  toggleTag: (tag) =>
    set((state) => ({
      tags: state.tags.includes(tag)
        ? state.tags.filter((t) => t !== tag)
        : [...state.tags, tag],
    })),

  fetchDreams: async () => {
    set({ loading: true });
    try {
      const res = await getDreams();
      set({ dreams: res.dreams ?? [], loading: false });
    } catch {
      set({ dreams: [], loading: false });
    }
  },

  addDream: (dream) =>
    set((state) => ({ dreams: [dream, ...state.dreams] })),

  setDreamShared: (dreamId, isShared) =>
    set((state) => ({
      dreams: state.dreams.map((dream) =>
        dream.id === dreamId ? { ...dream, isShared } : dream
      ),
    })),

  resetForm: () => set({ dreamText: "", mood: null, tags: [] }),
}));
