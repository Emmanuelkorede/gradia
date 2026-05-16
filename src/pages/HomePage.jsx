import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { SchoolContext } from "../context/SchoolContext";
import { supabase } from "../lib/supabaseClient";
import ActivationCard from "../components/home/ActivationCard";
import NewsFeedItem from "../components/home/NewsFeedItem";
import WinnerPopup from "../components/leaderboard/WinnerPopup";
import BottomNav from '../components/ui/BottomNav';
import { HiOutlineBell, HiFire, HiLightningBolt, HiBookOpen, HiInbox } from "react-icons/hi";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const { profile, isPremium } = useAuth();
  const { selectedSchool, userStats, refreshStats } = useContext(SchoolContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [notiLoading, setNotiLoading] = useState(true);
  const [winnerData, setWinnerData] = useState(null); 
  const [showWinner, setShowWinner] = useState(false);
  const [pageRevealed, setPageRevealed] = useState(false);

  const firstName = profile?.display_name?.split(" ")[0] ?? "";

  useEffect(() => {
    refreshStats();
    const t = setTimeout(() => setPageRevealed(true), 60);
    return () => clearTimeout(t);
  }, [refreshStats]);

  useEffect(() => {
    async function loadNotifications() {
      setNotiLoading(true);
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      setNotifications(data ?? []);
      setNotiLoading(false);
    }
    loadNotifications();
  }, []);

  // Add this useEffect inside your HomePage component
useEffect(() => {
  async function checkWeeklyWinner() {
    if (!profile?.id) return;

    // Fetch from weekly_winners table
    const { data, error } = await supabase
      .from("weekly_winners")
      .select("*")
      .eq("user_id", profile.id)
      .eq("claimed_status", false) // Only show if they haven't seen it yet
      .maybeSingle();

    if (data && !error) {
      setWinnerData(data);
      setShowWinner(true);
    }
  }

  checkWeeklyWinner();
}, [profile?.id]);

  return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] font-sans pb-24 transition-colors">
      
      {/* ── Ultra-Compact Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0d1a0c]/80 backdrop-blur-md border-b border-green-900/5 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-[#1a3312] dark:text-[#d8f0c8] font-serif tracking-tight leading-tight">
              <span className="text-sm font-medium text-[#6a9e5e] dark:text-[#4a6e42] font-sans mr-1">
                {getGreeting()},
              </span>
              {firstName ? (firstName) : (<span className="animate-pulse bg-emerald-800/50 inline-block w-16 h-5 rounded vertical-middle" />)}
            </h1>
            
            <div className="flex items-center gap-2 mt-0.5">
              <div className="bg-white dark:bg-white/5 border border-green-900/10 px-2 py-0.5 rounded-full">
                <span className="text-[9px] font-black text-[#3a6230] dark:text-[#8fc878] uppercase tracking-wider">
                  {selectedSchool}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-900/20">
                <HiFire className="text-orange-500 text-[10px]" />
                <span className="text-[9px] font-black text-orange-700 dark:text-orange-400">
                  {userStats?.streak || 0} DAYS
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-full bg-green-900/5 dark:bg-white/5 text-[#4a8c38] active:scale-90 transition-transform"
          >
            <HiOutlineBell className="text-xl" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0d1a0c]" />
            )}
          </button>
        </div>
      </header>

      {/* ── Main Body ────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 mt-3 space-y-5">
        
        {!isPremium && (
          <div className={`transition-all duration-700 ${pageRevealed ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
            <ActivationCard />
          </div>
        )}

        {/* Stats Section */}
        <section className="grid grid-cols-3 gap-2.5">
          {userStats?.loading ? (
             <div className="col-span-3 h-16 bg-white/50 dark:bg-white/5 animate-pulse rounded-2xl" />
          ) : (
            <>
              <StatCard label="Tests" value={userStats?.testsDone || 0} delay="100ms" revealed={pageRevealed} />
              <StatCard label="Avg Score" value={`${userStats?.avgScore || 0}%`} delay="200ms" revealed={pageRevealed} />
              <StatCard label="Rank" value={userStats?.rank || '-'} delay="300ms" revealed={pageRevealed} />
            </>
          )}
        </section>

        {/* Quick Actions */}
        <section className={`space-y-2.5 transition-all duration-700 delay-400 ${pageRevealed ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
          <h3 className="text-[11px] font-black text-[#1a3312] dark:text-[#d8f0c8] uppercase tracking-[0.2em] ml-1">Training</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickCard 
              title="Study Mode"
              sub="Practice sessions"
              icon={<HiBookOpen />}
              onClick={() => navigate("/cbt", { state: { mode: "study" } })}
              variant="light"
              locked={!isPremium}
            />
            <QuickCard 
              title="Test Mode"
              sub="Timed mock exam"
              icon={<HiLightningBolt />}
              onClick={() => navigate("/cbt", { state: { mode: "test" } })}
              variant="dark"
            />
          </div>
        </section>

        {/* Updates Section */}
        <section className="space-y-2.5 pb-4">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[11px] font-black text-[#1a3312] dark:text-[#d8f0c8] uppercase tracking-[0.2em]">Updates</h3>
             <button onClick={() => navigate('/notifications')} className="text-[10px] font-bold text-[#5a9e48] tracking-tighter">VIEW ALL</button>
          </div>
          
          <div className="space-y-2">
            {notiLoading ? (
              <div className="h-20 bg-white/40 dark:bg-white/5 rounded-2xl animate-pulse" />
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-white dark:bg-[#111e0f] rounded-3xl border border-dashed border-green-900/10">
                <HiInbox className="text-2xl text-[#9ab88a] mb-2" />
                <p className="text-[11px] font-medium text-[#9ab88a]">No updates for you yet.</p>
              </div>
            ) : (
              notifications.map(n => <NewsFeedItem key={n.id} {...n} />)
            )}
          </div>
        </section>
      </main>

      <BottomNav />
      {winnerData && (
        <WinnerPopup 
          isOpen={showWinner} 
          rank={winnerData.rank} 
          avgScore={winnerData.avgScore} 
          winnerId={winnerData.id}
          displayName={profile?.display_name || "Champ"}
          onClose={() => setShowWinner(false)} 
        />
      )}
    </div>
  );
}

/* ── Helper Components ────────────────────────────────────────── */

function StatCard({ label, value, delay, revealed }) {
  return (
    <div 
      style={{ transitionDelay: delay }}
      className={`bg-white dark:bg-[#111e0f] border border-green-900/5 dark:border-[#1f3319] p-3 rounded-2xl text-center shadow-sm transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
    >
      <p className="text-base font-black text-[#1a3312] dark:text-white font-serif leading-none mb-1">{value}</p>
      <p className="text-[8px] font-bold text-[#9ab88a] uppercase tracking-wider">{label}</p>
    </div>
  );
}

function QuickCard({ title, sub, icon, onClick, variant, locked }) {
  const isDark = variant === 'dark';
  return (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden p-4 rounded-[22px] text-left transition-all active:scale-95 border ${
        isDark 
        ? "bg-[#3d7830] border-transparent text-white shadow-lg" 
        : "bg-white dark:bg-[#111e0f] border-green-900/10 dark:border-[#1f3319] text-[#1a3312] dark:text-white"
      }`}
    >
      <div className={`text-xl mb-2.5 ${isDark ? "text-green-200" : "text-[#5a9e48]"}`}>{icon}</div>
      <p className="text-xs font-black tracking-tight uppercase">{title}</p>
      <p className={`text-[9px] leading-tight mt-0.5 ${isDark ? "text-green-100/60" : "text-[#6a9e5e]"}`}>{sub}</p>
      {locked && <div className="absolute top-3 right-3 text-[10px]">🔒</div>}
    </button>
  );
}