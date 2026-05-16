import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useQuestions({
  school = "",
  subjects = [],
  limit = 100,
  enabled = true,
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
      
      const fetchPromises = subjects.map((subject) =>
        supabase
          .from("questions")
          .select("id, school, subject, question_text, option_a, option_b, option_c, option_d, correct_option, explanation")
          .eq("school", school)
          .eq("subject", subject)
          .limit(perSubjectLimit + 20)
      );

      const results = await Promise.all(fetchPromises);

      // ── THE NEW LOGIC: Grouped but Shuffled ──
      const organizedQuestions = results.flatMap((res) => {
        const rawData = res.data ?? [];
        
        // 1. Shuffle only the questions for THIS specific subject
        const shuffledSubjectPool = rawData.sort(() => Math.random() - 0.5);
        
        // 2. Take only the number needed for this subject
        const selectedForSubject = shuffledSubjectPool.slice(0, perSubjectLimit);
        
        // 3. Map the options into the object format you need
        return selectedForSubject.map(q => ({
          ...q,
          options: {
            A: q.option_a,
            B: q.option_b,
            C: q.option_c,
            D: q.option_d
          }
        }));
      });

      // We DON'T shuffle 'organizedQuestions' again here. 
      // Because we flatMapped the subjects in order, they stay grouped: 
      // [Eng, Eng, Eng, Math, Math, Math...]
      
      setQuestions(organizedQuestions.slice(0, limit)); 
      
    } catch (err) {
      console.error("useQuestions error:", err);
      setError(err.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, [school, subjects.join(","), limit, enabled]);

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