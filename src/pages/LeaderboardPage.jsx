import { useContext, useState } from "react";
import { useNavigate } from "react-router"; // Added router navigation
import { useAuth } from "../hooks/useAuth";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { SchoolContext } from "../context/SchoolContext";
import RankRow from "../components/leaderboard/RankRow";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import BottomNav from "../components/ui/BottomNav";

/**
 * LeaderboardPage.jsx — Tab 3 (Updated Sticky Header UI)
 */

const PERIODS = [
  { key: "weekly",  label: "This Week" },
  { key: "monthly", label: "This Month" },
  { key: "alltime", label: "All Time" },
];

const SCHOOL_FILTERS = [
  { key: "all",    label: "All Schools" },
  { key: "UI",     label: "UI" },
  { key: "UNILAG", label: "UNILAG" },
  { key: "OAU",    label: "OAU" },
];

function Podium({ topThree }) {
  if (topThree.length < 1) return null;

  const order = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const heights = { 0: "h-16", 1: "h-[90px]", 2: "h-13" };

  const SCHOOL_COLORS = {
    UI:     "bg-blue-500",
    UNILAG: "bg-red-500",
    OAU:    "bg-green-500",
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0d2c08] via-[#1a4a10] to-[#0e3208] pt-7 pb-0 px-5">
      <div className="absolute -top-[60px] -left-[60px] w-[200px] h-[200px] rounded-full bg-radial-gradient from-[rgba(90,200,72,.15)] to-transparent pointer-events-none" />
      <div className="absolute -bottom-[40px] -right-[40px] w-[160px] h-[160px] rounded-full bg-radial-gradient from-[rgba(61,120,48,.2)] to-transparent pointer-events-none" />

      <h2 className="font-serif text-20 font-black text-white text-center mb-1 relative">
        🏆 Leaderboard
      </h2>
      <p className="text-center text-[11px] text-white/45 mb-6 relative">
        Top performers this period
      </p>

      <div className="relative flex items-end justify-center gap-2.5">
        {order.map((entry, i) => {
          if (!entry) return <div key={i} className="flex-1" />;
          const isGold    = entry.rank === 1;
          const avatarBg  = `hsl(${(entry.displayName.charCodeAt(0) * 37 + (entry.displayName.charCodeAt(1) ?? 0) * 13) % 360}, 50%, 42%)`;
          const initials  = entry.displayName.split(" ").map(w => w[0]?.toUpperCase() ?? "").slice(0,2).join("");
          const medal     = ["🥈","🥇","🥉"][i];
          const blockH    = heights[i];

          return (
            <div key={entry.rank} className="flex-1 flex flex-col items-center gap-0">
              <div className={`mb-1.5 transition-transform text-20 ${isGold ? "text-26 shadow-amber-500/60 drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)]" : ""}`}>
                {medal}
              </div>
              
              <div 
                className={`rounded-full flex items-center justify-center font-bold text-white mb-1.5 transition-all
                  ${isGold ? "w-13 h-13 text-base border-[2.5px] border-[rgba(212,175,55,0.7)] shadow-lg shadow-amber-500/35" : "w-10 h-10 text-xs border-[2.5px] border-white/20"}`}
                style={{ backgroundColor: avatarBg }}
              >
                {initials}
              </div>

              <p className="text-[11px] font-bold text-white text-center mb-1 leading-tight max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">
                {entry.displayName.split(" ")[0]}
              </p>

              <p className={`font-serif font-bold mb-1.5 ${isGold ? "text-18 text-amber-400" : "text-14 text-white/80"}`}>
                {entry.avgScore}%
              </p>

              <div className={`w-1.5 h-1.5 rounded-full mb-1.5 ${SCHOOL_COLORS[entry.school] ?? "bg-white"}`} />

              <div className={`w-full ${blockH} rounded-t-lg border-b-0 flex items-center justify-center border
                ${isGold 
                  ? "bg-gradient-to-b from-[rgba(212,175,55,0.35)] to-[rgba(212,175,55,0.15)] border-[rgba(212,175,55,0.3)]" 
                  : "bg-white/8 border-white/10"
                }`}
              >
                <span className={`font-serif text-20 font-black ${isGold ? "text-[rgba(212,175,55,0.8)]" : "text-white/25"}`}>
                  #{entry.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LockOverlay() {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#f5f9f2] via-[#f5f9f2]/85 to-transparent flex items-end justify-center pb-6">
      <div className="bg-white rounded-[20px] p-[20px_22px] text-center shadow-2xl shadow-green-900/12 border-[1.5px] border-green-900/15 max-w-[300px]">
        <div className="text-32 mb-2">🔐</div>
        <p className="font-serif text-17 font-black text-[#1a3312] mb-14">
          Leaderboard is Premium
        </p>
        <p className="text-xs text-[#5a7e4e] leading-relaxed mb-3.5">
          Compete with students from your school and claim your spot in the top 10.
        </p>
        <Button fullWidth onClick={() => navigate("/premium")}>Unlock — ₦2,000</Button>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { isPremium, user } = useAuth();
  const { selectedSchool }  = useContext(SchoolContext);

  const [period,       setPeriod]       = useState("weekly");
  const [schoolFilter, setSchoolFilter] = useState(selectedSchool);

  const { entries, loading, error, userRank, topThree, refetch } = useLeaderboard({
    school: schoolFilter,
    period,
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] pb-[90px]">

      <Podium topThree={topThree} />

      {/* ── MODERN STICKY FILTER BAR ───────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0d1a0c]/90 border-b border-green-900/10 dark:border-green-900/12 px-4 py-3 flex items-center justify-between backdrop-blur-md">
        
        {/* Left Side: Clean Heading Context */}
        <div>
          <h3 className="font-serif text-base font-black text-[#1a3312] dark:text-[#d8f0c8]">
            Scores
          </h3>
        </div>

        {/* Right Side: Modern Select Dropdowns */}
        <div className="flex gap-2">
          {/* Period Select Button */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-green-900/5 dark:bg-white/5 border border-green-900/10 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#4a6e42] dark:text-[#7ac86a] focus:outline-none focus:border-[#5a9e48] transition-colors cursor-pointer"
          >
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key} className="bg-white dark:bg-[#0b160a] text-gray-800 dark:text-gray-200">
                {p.label}
              </option>
            ))}
          </select>

          {/* School Select Button */}
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="bg-green-900/5 dark:bg-white/5 border border-green-900/10 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#4a6e42] dark:text-[#7ac86a] focus:outline-none focus:border-[#5a9e48] transition-colors cursor-pointer"
          >
            {SCHOOL_FILTERS.map((s) => (
              <option key={s.key} value={s.key} className="bg-white dark:bg-[#0b160a] text-gray-800 dark:text-gray-200">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── STICKY RANK CARD ──────────────────────────────────── */}
      {isPremium && userRank && (
        <div className="mx-4 mt-3 bg-gradient-to-br from-green-900/8 to-green-900/4 border-[1.5px] border-green-900/30 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#5a7e4e] mb-0.5">Your Rank</p>
            <p className="font-serif text-22 font-black text-[#1a3312] dark:text-[#d8f0c8]">#{userRank}</p>
            <p className="text-[10.5px] text-[#9ab88a]">{period === "weekly" ? "This week" : period === "monthly" ? "This month" : "All time"}</p>
          </div>
          <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-[#5a9e48] to-[#3d7830] flex items-center justify-center">
            {userRank <= 3 ? (
              <span className="text-22">{userRank === 1 ? "🥇" : userRank === 2 ? "🥈" : "🥉"}</span>
            ) : (
              <span className="font-serif text-16 font-black text-white">#{userRank}</span>
            )}
          </div>
        </div>
      )}

      {/* ── RANKINGS LIST ──────────────────────────────────────── */}
      <div className="relative px-3.5 pt-3 flex flex-col gap-1.5">
        
        {!isPremium && entries.length > 0 && <LockOverlay />}

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size={28} color="green" />
          </div>
        ) : error ? (
          <div className="mx-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/10 border border-red-300 text-center text-[12.5px] text-red-600">
            ⚠ {error}
            <br />
            <button
              onClick={refetch}
              className="mt-2.5 bg-none border-none text-red-600 font-bold cursor-pointer text-xs"
            >
              Try again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 px-5">
            <div className="text-36 mb-2.5">📊</div>
            <p className="text-13 text-[#9ab88a] font-medium">No results yet for this period</p>
            <p className="text-[11.5px] text-[#b8d4a8] mt-1">Complete a test to appear on the leaderboard!</p>
          </div>
        ) : (
          entries.map((entry, i) => (
            <RankRow
              key={entry.userId}
              rank={entry.rank}
              displayName={entry.displayName}
              school={entry.school}
              avgScore={entry.avgScore}
              bestScore={entry.bestScore}
              totalTests={entry.totalTests}
              isCurrentUser={entry.userId === user?.id}
              animDelay={i * 35}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}