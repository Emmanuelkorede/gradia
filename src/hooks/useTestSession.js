import { useState, useCallback, useRef, useContext } from "react"; // Added useContext
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";
import { SchoolContext } from "../context/SchoolContext"; // Make sure path is correct

export function useTestSession({
  questions = [],
  mode = "test",
  school = "",
  durationSeconds = 3600,
} = {}) {
  const { user } = useAuth();
  const { refreshStats } = useContext(SchoolContext); // Hook into the refresh function

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const autoSubmittedRef = useRef(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;
  const canGoNext = currentIndex < totalQuestions - 1;
  const canGoPrev = currentIndex > 0;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  function isAnswered(questionId) {
    return Boolean(answers[questionId]);
  }

  const selectAnswer = useCallback((questionId, option) => {
    if (isFinished) return;
    setAnswers((prev) => {
      if (mode === "study" && prev[questionId]) return prev;
      return { ...prev, [questionId]: option };
    });
  }, [isFinished, mode]);

  const goNext = useCallback(() => {
    if (canGoNext) setCurrentIndex((i) => i + 1);
  }, [canGoNext]);

  const goPrev = useCallback(() => {
    if (canGoPrev) setCurrentIndex((i) => i - 1);
  }, [canGoPrev]);

  const jumpTo = useCallback((index) => {
    if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
  }, [totalQuestions]);

  function calculateResult() {
    const correctIds = [];
    const wrongIds = [];
    const skippedIds = [];

    questions.forEach((q) => {
      const picked = answers[q.id];
      if (!picked) skippedIds.push(q.id);
      else if (picked === q.correct_option) correctIds.push(q.id);
      else wrongIds.push(q.id);
    });

    const score = correctIds.length;
    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return { score, total, percentage, correctIds, wrongIds, skippedIds };
  }

  const submitTest = useCallback(async () => {
    if (isFinished || isSubmitting || mode === "study") return;

    setIsSubmitting(true);
    const computed = calculateResult();
    setResult(computed);
    setIsFinished(true);

    if (user) {
      try {
        const subjects = [...new Set(questions.map((q) => q.subject))];
        
        const saveResult = supabase.from("test_results").insert({
          user_id: user.id,
          score: computed.score,
          total_questions: computed.total,
          school,
          subjects,
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select("streak_count, last_activity_date")
          .eq("id", user.id)
          .single();

        const today = new Date().toISOString().split('T')[0];
        let newStreak = profile?.streak_count || 0;
        const lastDate = profile?.last_activity_date;

        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastDate === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        const updateProfile = supabase
          .from("profiles")
          .update({ 
            streak_count: newStreak, 
            last_activity_date: today 
          })
          .eq("id", user.id);

        // Run both updates
        await Promise.all([saveResult, updateProfile]);

        // ── SYNC THE GLOBAL STATS ──
        // This ensures the Home Page has the new score/streak ready
        if (refreshStats) await refreshStats();

      } catch (err) {
        console.error("Database sync failed:", err.message);
      }
    }

    setIsSubmitting(false);
  }, [isFinished, isSubmitting, mode, answers, questions, user, school, refreshStats]);

  const handleTimerExpire = useCallback(() => {
    if (!autoSubmittedRef.current && !isFinished) {
      autoSubmittedRef.current = true;
      submitTest();
    }
  }, [isFinished, submitTest]);

  const handleTimerTick = useCallback((sLeft) => {
    setSecondsLeft(sLeft);
  }, []);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setIsSubmitting(false);
    setResult(null);
    setSecondsLeft(durationSeconds);
    autoSubmittedRef.current = false;
  }, [durationSeconds]);

  return {
    currentIndex,
    currentQuestion,
    answers,
    secondsLeft,
    isFinished,
    isSubmitting,
    result,
    totalQuestions,
    answeredCount,
    canGoNext,
    canGoPrev,
    allAnswered,
    isAnswered,
    selectAnswer,
    goNext,
    goPrev,
    jumpTo,
    submitTest,
    resetSession,
    handleTimerExpire,
    handleTimerTick,
  };
}