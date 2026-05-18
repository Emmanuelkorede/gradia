import { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router"; // 1. Added useParams here
import { useAuth } from "../hooks/useAuth";
import { SchoolContext } from "../context/SchoolContext";
import { supabase } from "../lib/supabaseClient";
import ProfileModal from "../components/ui/profileModal";
import BottomNav from "../components/ui/BottomNav";
import { HiHeart, HiOutlineHeart, HiShare, HiChevronLeft, HiInbox, HiOutlineBell } from "react-icons/hi";

// ── Time Formatting Helper ──────────────────────────────────────────
function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)          return "Just now";
  if (diff < 3600)        return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)   return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function NotificationPage() {
  const { profile } = useAuth();
  const { selectedSchool } = useContext(SchoolContext);
  const navigate = useNavigate();
  const { id } = useParams(); // 2. Read the dynamic notification ID directly out of the URL string

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState(new Set());
  const [selectedNoti, setSelectedNoti] = useState(null);

  // 1. Fetch notifications and user's past likes
  useEffect(() => {
    async function fetchNotificationsData() {
      setLoading(true);
      try {
        const { data: notis, error: notiErr } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false });

        if (notiErr) throw notiErr;

        if (profile?.id) {
          const { data: likedRows } = await supabase
            .from("notification_likes")
            .select("notification_id")
            .eq("user_id", profile.id);

          const likedSet = new Set(likedRows?.map((r) => r.notification_id) || []);
          setUserLikes(likedSet);
        }

        setNotifications(notis || []);

        // 3. Deep-link integration: If an ID was provided in the URL link, pop it open automatically!
        if (id && notis) {
          const targetNoti = notis.find(n => n.id === id);
          if (targetNoti) {
            setSelectedNoti(targetNoti);
          } else {
            // Fallback: If it's old and not in the main list array cache, query it directly from DB
            const { data: directNoti } = await supabase
              .from("notifications")
              .select("*")
              .eq("id", id)
              .single();
            
            if (directNoti) setSelectedNoti(directNoti);
          }
        }

      } catch (err) {
        console.error("Error loading updates dashboard:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNotificationsData();
  }, [profile?.id, id]); // Added id as dependency dependency 

  // 2. Handle Like Action with local join table safeguards
  async function handleLike(e, notiId) {
    e.stopPropagation(); 
    if (!profile?.id) return;

    const isLiked = userLikes.has(notiId);

    if (isLiked) {
      setUserLikes((prev) => {
        const next = new Set(prev);
        next.delete(notiId);
        return next;
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notiId ? { ...n, likes_count: Math.max(0, (n.likes_count || 1) - 1) } : n))
      );
      if (selectedNoti?.id === notiId) {
        setSelectedNoti(prev => ({ ...prev, likes_count: Math.max(0, (prev.likes_count || 1) - 1) }));
      }

      try {
        await supabase
          .from("notification_likes")
          .delete()
          .eq("user_id", profile.id)
          .eq("notification_id", notiId);
        await supabase.rpc("decrement_likes", { notification_id: notiId });
      } catch (err) {
        console.error("Failed handling unlike transaction rollback:", err);
      }
    } else {
      setUserLikes((prev) => {
        const next = new Set(prev);
        next.add(notiId);
        return next;
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notiId ? { ...n, likes_count: (n.likes_count || 0) + 1 } : n))
      );
      if (selectedNoti?.id === notiId) {
        setSelectedNoti(prev => ({ ...prev, likes_count: (prev.likes_count || 0) + 1 }));
      }

      try {
        await supabase
          .from("notification_likes")
          .insert({ user_id: profile.id, notification_id: notiId });
        await supabase.rpc("increment_likes", { notification_id: notiId });
      } catch (err) {
        console.error("Failed handling like transaction rollback:", err);
      }
    }
  }

  // 3. System Native Apps Share Menu
  async function handleShare(e, noti) {
    e.stopPropagation(); 
    const shareUrl = `https://gradia-cbt.vercel.app/notifications/${noti.id}`; 
    const shareText = `Check this news out on Gradia: ${noti.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: noti.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Native share cancelled or failed:", err);
      }
    } else {
      const whatsappFallback = `https://wa.me/?text=${encodeURIComponent(shareText + " — " + shareUrl)}`;
      window.open(whatsappFallback, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] font-sans pb-24 transition-colors duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0d1a0c]/80 backdrop-blur-md border-b border-green-900/5 px-4 py-3.5">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate("/home")} // Clean fall-back route instead of raw stacked history go-backs
              className="p-1.5 rounded-full hover:bg-green-900/5 dark:hover:bg-white/5 text-[#4a8c38] transition-colors"
            >
              <HiChevronLeft className="text-2xl" />
            </button>
            <h1 className="text-base font-black text-[#1a3312] dark:text-[#d8f0c8] uppercase tracking-wider">Updates & News</h1>
          </div>
          <div className="bg-white dark:bg-white/5 border border-green-900/10 px-2.5 py-0.5 rounded-full shrink-0">
            <span className="text-[9px] font-black text-[#3a6230] dark:text-[#8fc878] uppercase tracking-wider">
              {selectedSchool} Aspirant
            </span>
          </div>
        </div>
      </header>

      {/* Main List Container */}
      <main className="max-w-2xl mx-auto px-4 mt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-24 bg-white/60 dark:bg-white/5 animate-pulse rounded-2xl border border-green-900/5" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#111e0f] rounded-3xl border border-dashed border-green-900/10 px-6 text-center">
            <HiInbox className="text-3xl text-[#9ab88a] mb-2" />
            <p className="text-xs font-semibold text-[#1a3312] dark:text-[#d8f0c8] mb-0.5">All caught up!</p>
            <p className="text-[11px] text-[#9ab88a] max-w-[220px]">There are currently no active notifications or board news right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((noti) => {
              const hasLiked = userLikes.has(noti.id);
              return (
                <div
                  key={noti.id}
                  onClick={() => {
                    setSelectedNoti(noti);
                    navigate(`/notifications/${noti.id}`, { replace: true }); // Clean URL switch on tap
                  }}
                  className="bg-white dark:bg-[#111e0f] border border-green-900/8 dark:border-[#1f3319] rounded-2xl p-4 relative overflow-hidden shadow-xs cursor-pointer active:scale-[0.99] hover:shadow-md transition-all duration-150"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-gradient-to-b from-[#7ac86a] to-[#3d7830]" />
                  
                  <div className="pl-2">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="text-[13.5px] font-bold text-[#1a3312] dark:text-[#d8f0c8] leading-snug flex-1">
                        {noti.title}
                      </h3>
                      <span className="text-[10px] font-medium text-[#9ab88a] whitespace-nowrap pt-0.5">
                        {timeAgo(noti.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-[#4a6e42] dark:text-[#6a9e5e] line-clamp-2 leading-relaxed mb-3">
                      {noti.content}
                    </p>

                    <div className="flex items-center justify-between border-t border-green-900/[0.04] dark:border-white/[0.02] pt-2.5">
                      <span className="text-[10px] font-bold tracking-wider text-[#9ab88a] uppercase flex items-center gap-1">
                        <HiOutlineBell className="text-xs text-[#5a9e48]" /> GRADIA BOARD
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleLike(e, noti.id)}
                          className={`flex items-center gap-1 border rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                            hasLiked
                              ? "bg-green-500/10 dark:bg-green-500/12 border-[#5a9e48] text-[#3d7830] dark:text-[#7ac86a]"
                              : "bg-transparent border-green-900/10 dark:border-white/10 text-[#5a7e4e] dark:text-[#9ab88a] active:bg-green-900/5"
                          }`}
                        >
                          {hasLiked ? <HiHeart className="text-xs text-green-600 animate-pulse" /> : <HiOutlineHeart className="text-xs" />}
                          <span>{noti.likes_count || 0}</span>
                        </button>

                        <button
                          onClick={(e) => handleShare(e, noti)}
                          className="flex items-center justify-center border border-green-900/10 dark:border-white/10 text-[#5a7e4e] dark:text-[#9ab88a] rounded-full p-1.5 bg-transparent active:bg-green-900/5 transition-colors"
                          title="Share update"
                        >
                          <HiShare className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ProfileModal overlay viewport popup */}
      <ProfileModal
        isOpen={!!selectedNoti}
        onClose={() => {
          setSelectedNoti(null);
          navigate("/notifications", { replace: true }); // Reset URL clean when user closes modal
        }}
        title={selectedNoti?.title || "Notification"}
      >
        {selectedNoti && (
          <div className="pb-1">
            <div className="flex items-center justify-between text-[10.5px] font-bold text-[#9ab88a] uppercase tracking-wide border-b border-green-900/5 dark:border-white/5 pb-2.5 mb-3">
              <span>📌 Official Update</span>
              <span>{new Date(selectedNoti.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>

            <p className="text-[13px] text-[#1a3312] dark:text-[#d8f0c8] leading-relaxed whitespace-pre-wrap max-h-[50dvh] overflow-y-auto pr-1">
              {selectedNoti.content}
            </p>

            <div className="flex justify-end items-center gap-2 border-t border-green-900/5 dark:border-white/5 pt-3.5 mt-4">
              <button
                onClick={(e) => handleLike(e, selectedNoti.id)}
                className={`flex items-center gap-1 border rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  userLikes.has(selectedNoti.id)
                    ? "bg-green-500/10 border-[#5a9e48] text-[#3d7830] dark:text-[#7ac86a]"
                    : "bg-transparent border-green-900/10 dark:border-white/10 text-[#5a7e4e] dark:text-[#9ab88a]"
                }`}
              >
                {userLikes.has(selectedNoti.id) ? <HiHeart className="text-sm text-green-600" /> : <HiOutlineHeart className="text-sm" />}
                <span>{selectedNoti.likes_count || 0} Likes</span>
              </button>

              <button
                onClick={(e) => handleShare(e, selectedNoti)}
                className="flex items-center gap-1 border border-green-900/10 dark:border-white/10 text-[#5a7e4e] dark:text-[#9ab88a] rounded-full px-3 py-1.5 text-xs font-semibold bg-transparent active:bg-green-900/5"
              >
                <HiShare className="text-sm" />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        )}
      </ProfileModal>

      <BottomNav />
    </div>
  ); 
}