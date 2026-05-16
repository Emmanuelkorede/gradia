import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

// ------------------------------------------------------------------
// useLeaderboard.js
// Fetches ranked leaderboard data from Supabase.
// Computes rankings from test_results joined with profiles.
//
// Arguments:
//   school   {string}  — filter by "UI" | "UNILAG" | "OAU" | "all"
//   period   "weekly" | "monthly" | "alltime"
//   limit    {number}  — number of top entries to show (default 50)
//
// Returns:
//   { entries, loading, error, userRank, refetch }
//
// Entry shape:
//   { rank, userId, displayName, school, avgScore, totalTests, bestScore }
//
// Usage:
//   const { entries, loading, userRank } = useLeaderboard({
//     school: selectedSchool,
//     period: "weekly",
//   });
// ------------------------------------------------------------------

// Returns ISO date string for the start of the current week (Monday)
function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day; // adjust so week starts Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

// Returns ISO date string for the start of the current month
function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export function useLeaderboard({
  school = "all",
  period = "weekly",
  limit  = 50,
} = {}) {
  const { user } = useAuth();

  const [entries,   setEntries]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [userRank,  setUserRank]  = useState(null); // current user's rank position

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Determine date filter ───────────────────────────────
      let dateFilter = null;
      if (period === "weekly")  dateFilter = getWeekStart();
      if (period === "monthly") dateFilter = getMonthStart();

      // ── 2. Build query ─────────────────────────────────────────
      // We pull test_results joined with profiles.
      // Supabase handles the join via the foreign key relationship.
      let query = supabase
        .from("test_results")
        .select(`
          user_id,
          score,
          total_questions,
          school,
          created_at,
          profiles ( display_name, target_school )
        `)
        .order("created_at", { ascending: false });

      // Filter by school
      if (school !== "all") {
        query = query.eq("school", school);
      }

      // Filter by time period
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      // ── 3. Aggregate by user ───────────────────────────────────
      // Group all results by userId, compute avg/best score
      const userMap = {};

      (data ?? []).forEach((row) => {
        const uid = row.user_id;
        const pct = row.total_questions > 0
          ? (row.score / row.total_questions) * 100
          : 0;

        if (!userMap[uid]) {
          userMap[uid] = {
            userId:      uid,
            displayName: row.profiles?.display_name || "Anonymous",
            school:      row.school,
            scores:      [],
            bestScore:   0,
          };
        }

        userMap[uid].scores.push(pct);
        if (pct > userMap[uid].bestScore) {
          userMap[uid].bestScore = pct;
        }
      });

      // ── 4. Compute average & sort ──────────────────────────────
      const ranked = Object.values(userMap)
        .map((u) => ({
          ...u,
          avgScore:   Math.round(u.scores.reduce((a, b) => a + b, 0) / u.scores.length),
          totalTests: u.scores.length,
          bestScore:  Math.round(u.bestScore),
        }))
        .sort((a, b) => b.avgScore - a.avgScore || b.bestScore - a.bestScore)
        .slice(0, limit)
        .map((u, i) => ({ ...u, rank: i + 1 }));

      setEntries(ranked);

      // ── 5. Find current user's rank ────────────────────────────
      if (user) {
        const myEntry = ranked.find((e) => e.userId === user.id);
        setUserRank(myEntry?.rank ?? null);
      }
    } catch (err) {
      console.error("useLeaderboard error:", err);
      setError(err.message || "Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [school, period, limit, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    loading,
    error,
    userRank,   // null if user isn't in current top N
    refetch: fetchLeaderboard,
    // Convenience: top 3 for podium display
    topThree: entries.slice(0, 3),
    // Whether the logged-in user is in the top 10 (weekly winner eligible)
    isTopTen: userRank !== null && userRank <= 10,
  };
}