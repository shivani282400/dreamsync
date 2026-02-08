import { create } from "zustand";

type Style = "plain" | "poetic";

export const useReflectionPrefs = create<{
  style: Style;
  setStyle: (s: Style) => void;
}>((set) => ({
  style: (localStorage.getItem("reflection_style") as Style) || "poetic",
  setStyle: (style) => {
    localStorage.setItem("reflection_style", style);
    set({ style });
  },
}));
