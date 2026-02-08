import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeFrequencyCard from "../components/insights/ThemeFrequencyCard";
import EmotionalTrendChart from "../components/insights/EmotionalTrendChart";
import DreamChapterCard from "../components/insights/DreamChapterCard";
import MonthlyReflectionCard from "../components/insights/MonthlyReflectionCard";
import InsightLetterCard from "../components/insights/InsightLetterCard";
import InsightsCalendar from "../components/insights/InsightsCalendar";
import TagTrendChart from "../components/insights/TagTrendChart";
import WordFrequencyCard from "../components/insights/WordFrequencyCard";
import MoodDistributionCard from "../components/insights/MoodDistributionCard";
import ReflectionFrequencyCard from "../components/insights/ReflectionFrequencyCard";
import {
  apiFetch,
  getCalendarStats,
  getDreamChapters,
  getMonthlyInsights,
  getTagTrends,
  getWeeklyInsights,
  getWordFrequency,
  getYearlyArc,
} from "../lib/apiClient";
import type {
  CalendarDay,
  DreamChapter,
  InsightContent,
  TagTrends,
  WordFrequency,
  YearlyArc,
} from "../lib/apiClient";
import { useInsightStore } from "../store/insightStore";

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getISOWeek(date: Date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

export default function Insights() {
  const [reflection, setReflection] = useState<any>(null);
  const [weeklyInsight, setWeeklyInsight] = useState<InsightContent | null>(null);
  const [monthlyInsight, setMonthlyInsight] = useState<InsightContent | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [tagTrends, setTagTrends] = useState<TagTrends | null>(null);
  const [wordFrequency, setWordFrequency] = useState<WordFrequency | null>(null);
  const [yearlyArc, setYearlyArc] = useState<YearlyArc | null>(null);
  const [chapters, setChapters] = useState<DreamChapter[]>([]);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const loadInsights = useInsightStore((s) => s.loadInsights);

  const [month, setMonth] = useState(getCurrentMonth());
  const [week, setWeek] = useState(getISOWeek(new Date()));
  const year = getCurrentYear();

  useEffect(() => {
    apiFetch("/reflections/monthly?period=2026-02")
      .then(setReflection)
      .catch(() => {});
    loadInsights().catch(() => {});
  }, [loadInsights]);

  useEffect(() => {
    getWeeklyInsights(week).then(setWeeklyInsight).catch(() => {});
  }, [week]);

  useEffect(() => {
    getMonthlyInsights(month).then(setMonthlyInsight).catch(() => {});
    getCalendarStats(month)
      .then((data) => setCalendarDays(data.days))
      .catch(() => setCalendarDays([]));
    getTagTrends({ month, limit: 6 }).then(setTagTrends).catch(() => {});
    getWordFrequency({ month, limit: 20 })
      .then(setWordFrequency)
      .catch(() => {});
  }, [month]);

  useEffect(() => {
    getYearlyArc(year).then(setYearlyArc).catch(() => {});
  }, [year]);

  useEffect(() => {
    getDreamChapters().then(setChapters).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
      {reflection && <MonthlyReflectionCard reflection={reflection} />}

      <h1 className="text-2xl font-light text-white/90">
        Your Dream Patterns
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-white/80">Weekly Insight</h2>
            <input
              type="week"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white/70"
            />
          </div>
          <Link
            to={`/insights/weekly/${week}`}
            className="text-xs text-white/50 hover:text-white/70"
          >
            Read full letter
          </Link>
          <InsightLetterCard title="" content={weeklyInsight} compact />
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-white/80">Monthly Insight</h2>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white/70"
            />
          </div>
          <Link
            to={`/insights/monthly/${month}`}
            className="text-xs text-white/50 hover:text-white/70"
          >
            Read full letter
          </Link>
          <InsightLetterCard title="" content={monthlyInsight} compact />
        </div>
      </div>

      <InsightsCalendar
        month={month}
        days={calendarDays}
        selectedDate={selectedDay?.date ?? null}
        onSelectDay={setSelectedDay}
      />

      {selectedDay && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-white/80">
              Dreams on {selectedDay.date}
            </h2>
            <button
              className="text-xs text-white/40"
              onClick={() => setSelectedDay(null)}
            >
              Close
            </button>
          </div>

          {selectedDay.dreams.length === 0 ? (
            <p className="text-sm text-white/40">
              No dreams recorded for this day.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDay.dreams.map((dream) => (
                <div
                  key={dream.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <p className="text-white/80 text-sm">
                    {dream.title || "Untitled Dream"}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(dream.createdAt).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dream.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoodDistributionCard days={calendarDays} />
        <ReflectionFrequencyCard days={calendarDays} />
      </div>

      <TagTrendChart data={tagTrends} />
      <WordFrequencyCard data={wordFrequency} />

      {yearlyArc && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-lg text-white/85">{yearlyArc.title}</h2>
          <p className="text-white/70">{yearlyArc.reflectiveDepth}</p>
          <div className="text-sm text-white/60 space-y-2">
            <p>
              <span className="text-white/50">Dominant themes:</span>{" "}
              {yearlyArc.dominantThemes.join(", ")}
            </p>
            <p>
              <span className="text-white/50">Emotional progression:</span>{" "}
              {yearlyArc.emotionalProgression}
            </p>
          </div>
          <p className="text-white/60 text-sm">{yearlyArc.closingNote}</p>
        </div>
      )}

      <ThemeFrequencyCard />
      <EmotionalTrendChart />

      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg text-white/85">Dream Chapters</h2>
          <p className="text-sm text-white/50 max-w-2xl">
            Dream Chapters group dreams that feel connected over time — recurring
            phases shaped by shared themes, emotions, or symbols.
          </p>
        </div>

        <div className="space-y-4">
          {chapters.length > 0 ? (
            chapters.map((chapter) => (
              <DreamChapterCard
                key={chapter.id}
                chapter={chapter}
                expanded={expandedChapterId === chapter.id}
                onToggle={() =>
                  setExpandedChapterId((prev) =>
                    prev === chapter.id ? null : chapter.id
                  )
                }
              />
            ))
          ) : (
            <p className="text-sm text-white/50">
              Chapters will appear once patterns repeat across multiple dreams.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
