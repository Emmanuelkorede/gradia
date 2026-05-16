import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useQuestions({
  school = "",
  subjects = [],
  limit = 100,
  enabled = true,
  isPremium = false, // 1. Pass down the user's premium status here
} = {}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async () => {
    if (!enabled || !school || subjects.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const perSubjectLimit = Math.ceil(limit / subjects.length);
      
      const fetchPromises = subjects.map((subject) => {
        let query = supabase
          .from("questions")
          .select("id, school, subject, question_text, option_a, option_b, option_c, option_d, correct_option, explanation")
          .eq("school", school)
          .eq("subject", subject);

        if (isPremium) {
          // Premium track: Pull anything and grab extra rows so shuffling feels random
          return query.limit(perSubjectLimit + 20);
        } else {
          // Free track: Pull ONLY rows marked as free, ordered strictly by id
          return query
            .eq("is_free", true)
            .order("id", { ascending: true })
            .limit(perSubjectLimit);
        }
      });

      const results = await Promise.all(fetchPromises);

      // ── THE CONDITIONAL LOGIC: Grouped by subject ──
      const organizedQuestions = results.flatMap((res) => {
        const rawData = res.data ?? [];
        let subjectPool = [];

        if (isPremium) {
          // 1. Shuffle only for premium users
          const shuffled = rawData.sort(() => Math.random() - 0.5);
          subjectPool = shuffled.slice(0, perSubjectLimit);
        } else {
          // 2. Free users get the raw data exactly as returned (sorted by ID)
          subjectPool = rawData;
        }
        
        // 3. Map the options into the uniform structure required by QuestionCard
        return subjectPool.map(q => ({
          ...q,
          options: {
            A: q.option_a,
            B: q.option_b,
            C: q.option_c,
            D: q.option_d
          }
        }));
      });
      
      setQuestions(organizedQuestions.slice(0, limit)); 
      
    } catch (err) {
      console.error("useQuestions error:", err);
      setError(err.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, [school, subjects.join(","), limit, enabled, isPremium]); // Added isPremium dependency

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
    total: questions.length,
  };
}