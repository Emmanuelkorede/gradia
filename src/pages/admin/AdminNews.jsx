import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "./AdminLayout";

export default function AdminNews() {
  const [newsList, setNewsList] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // --- Mobile Dialog Modal States ---
  const [modal, setModal] = useState({ isOpen: false, type: "", message: "", title: "", targetId: null });

  // 1. Fetch all announcements on load
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
    } catch (err) {
      console.error("Failed to load news:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // 2. Handle creating a new global announcement
  async function handleCreateAnnouncement(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([{ title: title.trim(), content: content.trim() }])
        .select();

      if (error) throw error;

      setTitle("");
      setContent("");
      
      if (data) {
        setNewsList((prev) => [data[0], ...prev]);
      }
      
      setModal({
        isOpen: true,
        type: "success",
        title: "Broadcast Successful",
        message: "Announcement broadcasted successfully to all active student timelines!"
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Broadcast Failed",
        message: err.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Trigger Confirmation UI for deletion
  function confirmDelete(id) {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Delete Announcement?",
      message: "Are you absolutely sure you want to drop this announcement? This process cannot be undone.",
      targetId: id
    });
  }

  // 3. Execution after modal confirmation
  async function executeDelete(id) {
    setModal({ ...modal, isOpen: false });
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setNewsList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Deletion Failed",
        message: err.message
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="font-serif text-lg font-bold text-[#1a3312] dark:text-[#d8f0c8]">
            News & Alerts Broadcaster
          </h2>
          <p className="text-xs text-[#5a7e4e] dark:text-gray-400">
            Compose global announcements and track student engagement logs.
          </p>
        </div>

        {/* ── 📬 BROADCAST CREATION FORM (COMPACT MOBILE CARD) ───────── */}
        <section className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/40 p-4 rounded-2xl shadow-xs">
          <h3 className="font-serif text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3.5 flex items-center gap-2">
            <span>📣</span> New Broadcast Channel
          </h3>

          <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-3">
            <div>
              <label className="block text-[10px] uppercase text-[#4a6e42] dark:text-gray-400 font-bold tracking-wider mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="JAMB 2026 Registration Notice"
                className="w-full p-3 bg-green-900/5 dark:bg-[#0d1f0e] border border-green-900/10 dark:border-emerald-900/60 rounded-xl text-xs text-[#1a3312] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[#4a6e42] dark:text-gray-400 font-bold tracking-wider mb-1">
                Alert Content / Message
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your official announcement context details here..."
                className="w-full p-3 bg-green-900/5 dark:bg-[#0d1f0e] border border-green-900/10 dark:border-emerald-900/60 rounded-xl text-xs text-[#1a3312] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#5a9e48] dark:bg-emerald-600 hover:bg-green-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-xs active:scale-[0.99] disabled:opacity-40"
            >
              {submitting ? "Broadcasting..." : "Send Announcement 🚀"}
            </button>
          </form>
        </section>

        {/* ── 📑 ACTIVE MOBILE TIMELINE FEED ───────────────────────────── */}
        <section className="space-y-3">
          <h3 className="font-serif text-xs font-bold text-[#1a3312] dark:text-gray-300 flex items-center gap-2 px-1">
            <span>🗂️</span> Active Feeds ({newsList.length})
          </h3>

          {loading ? (
            <p className="text-center text-xs text-[#9ab88a] py-6 font-mono">
              Loading timeline packages...
            </p>
          ) : newsList.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-green-900/20 dark:border-emerald-900/20 bg-green-900/5 dark:bg-[#112412]/30 rounded-2xl text-xs text-[#9ab88a]">
              No active announcements broadcasted yet. Feed is clear.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {newsList.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className="p-4 bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/30 rounded-2xl flex flex-col gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-xs font-black text-[#1a3312] dark:text-white tracking-wide leading-tight">
                        {announcement.title}
                      </h4>
                      
                      <button
                        onClick={() => confirmDelete(announcement.id)}
                        disabled={deletingId === announcement.id}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/30 dark:border-red-900/20 active:scale-95 transition"
                      >
                        {deletingId === announcement.id ? "..." : "🗑️"}
                      </button>
                    </div>
                    
                    <p className="text-[9px] font-mono text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(announcement.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    
                    <p className="text-xs text-[#4a6e42] dark:text-gray-300 mt-2.5 bg-green-900/5 dark:bg-black/10 p-3 rounded-xl whitespace-pre-wrap leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>

                  {/* ❤️ Engagement UI Metrics footer */}
                  <div className="flex items-center gap-2 pt-1.5 border-t border-green-900/5 dark:border-emerald-900/20">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-green-900/5 dark:bg-[#0d1f0e] border border-green-900/10 dark:border-emerald-900/30 text-[#4a6e42] dark:text-gray-400 font-medium">
                      <span>❤️</span> 
                      <strong className="text-[#1a3312] dark:text-white font-black">{announcement.likes_count || 0}</strong> student likes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── APP CENTRAL REUSABLE SCREEN MODAL DIALOG CONTAINER ───────── */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/50 rounded-2xl p-5 shadow-2xl animate-in scale-in duration-150">
            <h4 className={`font-serif text-sm font-bold mb-1.5 ${
              modal.type === "error" ? "text-red-500" : modal.type === "confirm" ? "text-amber-500" : "text-[#1a3312] dark:text-emerald-400"
            }`}>
              {modal.title}
            </h4>
            <p className="text-xs text-[#4a6e42] dark:text-gray-300 leading-relaxed mb-4">
              {modal.message}
            </p>

            <div className="flex items-center justify-end gap-2">
              {modal.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setModal({ ...modal, isOpen: false })}
                    className="px-3.5 py-2 rounded-xl text-[11px] font-bold bg-green-900/5 dark:bg-white/5 text-[#4a6e42] dark:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => executeDelete(modal.targetId)}
                    className="px-3.5 py-2 rounded-xl text-[11px] font-bold bg-red-500 text-white shadow-xs active:scale-95 transition"
                  >
                    Confirm Drop
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="px-4 py-2 w-full text-center rounded-xl text-[11px] font-bold bg-[#5a9e48] dark:bg-emerald-600 text-white shadow-xs"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}