
import { create } from "zustand";
import { apiFetch } from "../lib/apiClient";



type FrequencyItem = { label: string; count: number };
type EmotionalTrend = { period: string; emotion: string; count: number };

type DreamCluster = {
  clusterId: string;
  label: string;
  dreamIds: string[];
};

type InsightState = {
  themes: FrequencyItem[];
  symbols: FrequencyItem[];
  emotionalTrends: EmotionalTrend[];
  clusters: DreamCluster[];
  loadInsights: () => Promise<void>;
};

export const useInsightStore = create<InsightState>((set) => ({
  themes: [],
  symbols: [],
  emotionalTrends: [],
  clusters: [],

  loadInsights: async () => {
    const [frequency, trends, clusters] = await Promise.all([
        apiFetch("/stats/frequency"),
        apiFetch("/stats/emotional-trends"),
        apiFetch("/stats/dream-clusters"),
      ]);
      
      set({
        themes: frequency.themes,
        symbols: frequency.symbols,
        emotionalTrends: trends.trends,
        clusters: clusters.clusters,
      });
      
  },
}));
