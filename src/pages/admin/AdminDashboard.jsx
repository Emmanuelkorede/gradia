import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalStudents: 0, premiumStudents: 0, totalQuestions: 0 });
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Fetch Shared Metrics
        const { count: studentCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
        const { count: premiumCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true);
        const { count: questionCount } = await supabase.from("questions").select("*", { count: "exact", head: true });

        setMetrics({
          totalStudents: studentCount || 0,
          premiumStudents: premiumCount || 0,
          totalQuestions: questionCount || 0,
        });

        // 2. Fetch Feedbacks (Plain fetch, matching client memory merge)
        const { data: feedbackData } = await supabase
          .from("feedbacks")
          .select("*")
          .order("created_at", { ascending: false });

        if (feedbackData && feedbackData.length > 0) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, email");

          const mergedData = feedbackData.map(fb => {
            const matchedProfile = profileData?.find(p => p.id === fb.user_id);
            return {
              ...fb,
              profiles: matchedProfile ? { email: matchedProfile.email } : { email: "Unknown Student" }
            };
          });

          setFeedbacks(mergedData);
        } else {
          setFeedbacks([]);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Updates the feedback status directly via a thumb-friendly mobile toggle button
  async function handleUpdateStatus(feedbackId, currentStatus) {
    const statusOrder = ["Pending", "Reviewed", "In Progress", "Resolved"];
    const nextIndex = (statusOrder.indexOf(currentStatus) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    setUpdatingId(feedbackId);
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ status: nextStatus })
        .eq("id", feedbackId);

      if (error) throw error;

      setFeedbacks(prev =>
        prev.map(item => item.id === feedbackId ? { ...item, status: nextStatus } : item)
      );
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="font-serif text-lg font-bold text-[#1a3312] dark:text-[#d8f0c8]">
            Overview Dashboard
          </h2>
          <p className="text-xs text-[#5a7e4e] dark:text-gray-400">
            Real-time stats and student feedback logs.
          </p>
        </div>

        {/* ── 📊 MOBILE METRICS GRID ───────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-2.5">
          <div className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/30 p-4 rounded-2xl shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#4a6e42] dark:text-emerald-500 tracking-wider">
              Total Registered
            </p>
            <p className="font-serif text-2xl font-black mt-0.5 text-[#1a3312] dark:text-white">
              {loading ? "..." : metrics.totalStudents}
            </p>
          </div>
          
          <div className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/30 p-4 rounded-2xl shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#4a6e42] dark:text-emerald-500 tracking-wider">
              Premium Activations
            </p>
            <p className="font-serif text-2xl font-black mt-0.5 text-amber-600 dark:text-amber-400">
              {loading ? "..." : metrics.premiumStudents}
            </p>
          </div>
          
          <div className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/30 p-4 rounded-2xl shadow-xs">
            <p className="text-[10px] uppercase font-bold text-[#4a6e42] dark:text-emerald-500 tracking-wider">
              Database Questions
            </p>
            <p className="font-serif text-2xl font-black mt-0.5 text-[#1a3312] dark:text-white">
              {loading ? "..." : metrics.totalQuestions}
            </p>
          </div>
        </section>

        {/* ── 📋 STUDENT FEEDBACK SYSTEM (MOBILE-LIST STRUCTURE) ───────── */}
        <section className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-sky-700 dark:text-sky-400 flex items-center gap-2 px-1">
            <span>🐛</span> Feedback & Bug Reports
          </h3>

          {loading ? (
            <p className="text-center text-xs text-[#9ab88a] py-6">
              Loading feedback transmissions...
            </p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center text-xs text-[#9ab88a] py-6">
              No student feedback reports found.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {feedbacks.map((row) => (
                <div 
                  key={row.id} 
                  className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col gap-3 shadow-xs"
                >
                  {/* Top Block: User Details & Category */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[#1a3312] dark:text-white truncate">
                        {row.profiles?.email || "Unknown"}
                      </span>
                      <span className="block text-[9px] font-mono text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        ID: {row.user_id || "No ID"}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 border ${
                      row.category === "Bug" 
                        ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-900/40" 
                        : row.category === "Suggestion" 
                        ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/40" 
                        : row.category === "Question" 
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40" 
                        : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200/50"
                    }`}>
                      {row.category}
                    </span>
                  </div>

                  {/* Message Summary */}
                  <p className="text-xs text-[#4a6e42] dark:text-gray-300 bg-green-900/5 dark:bg-black/20 p-3 rounded-xl break-words leading-relaxed">
                    {row.message}
                  </p>

                  {/* Bottom Block: Status Badge & Update Trigger Action */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-green-900/5 dark:border-emerald-900/20">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                        row.status === "Resolved" 
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" 
                          : row.status === "In Progress" 
                          ? "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40" 
                          : row.status === "Reviewed" 
                          ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40" 
                          : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                      }`}>
                        <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                        {row.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(row.id, row.status)}
                      disabled={updatingId === row.id}
                      className="px-3 py-1.5 bg-[#5a9e48] dark:bg-[#162b10] border border-green-600/20 dark:border-emerald-800/50 hover:bg-green-600 dark:hover:bg-emerald-900 text-white dark:text-emerald-400 font-bold rounded-xl text-[10px] transition active:scale-95 disabled:opacity-40"
                    >
                      {updatingId === row.id ? "Saving..." : "Cycle Status ➡️"}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </AdminLayout>
  );
}