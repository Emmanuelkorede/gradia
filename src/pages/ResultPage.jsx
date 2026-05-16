import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import CorrectionBox from "../components/cbt/CorrectionBox";
import Button from "../components/ui/Button";



function getGrade(pct) {
  if (pct >= 80) return { label: "Excellent",  color: "#16a34a", emoji: "🏆" };
  if (pct >= 65) return { label: "Good",        color: "#3b82f6", emoji: "👍" };
  if (pct >= 50) return { label: "Average",     color: "#f59e0b", emoji: "📈" };
  if (pct >= 40) return { label: "Below Avg",   color: "#f97316", emoji: "📚" };
  return               { label: "Needs Work",   color: "#ef4444", emoji: "💪" };
}

function getMotiMessage(pct) {
  if (pct >= 80) return "You're absolutely crushing it. Keep this energy!";
  if (pct >= 65) return "Solid performance. Push a little harder next time.";
  if (pct >= 50) return "Not bad — but your target school expects more. Keep drilling!";
  if (pct >= 40) return "You're building the foundation. Consistency will get you there.";
  return "Every expert was once a beginner. Review and retry — you've got this.";
}

function ScoreRing({ percentage, color }) {
  const RADIUS = 70;
  const CIRC   = 2 * Math.PI * RADIUS;
  const offset = CIRC * (1 - Math.min(percentage, 100) / 100);

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="overflow-visible">
      <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10"/>
      <circle
        cx="90" cy="90" r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        transform="rotate(-90 90 90)"
        className="transition-[stroke-dashoffset] duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
      />
    </svg>
  );
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  const {
    result    = {},
    questions = [],
    answers   = {},
    subjects  = []
  } = location.state ?? {};

  const { score = 0, total = 0, percentage = 0, correctIds = [], wrongIds = [], skippedIds = [] } = result;

  useEffect(() => {
    if (!location.state?.result) navigate("/cbt", { replace: true });
  }, [location.state, navigate]);

  const grade = getGrade(percentage);
  const moti  = getMotiMessage(percentage);

  const [showCorrections, setShowCorrections] = useState(false);
  const [corrFilter,      setCorrFilter]      = useState("all"); 
  const [heroRevealed,    setHeroRevealed]    = useState(false);
  const [ringAnimated,    setRingAnimated]    = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeroRevealed(true), 100);
    const t2 = setTimeout(() => setRingAnimated(true), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const subjectBreakdown = subjects.map((sub) => {
    const subQs      = questions.filter((q) => q.subject === sub);
    const subCorrect = subQs.filter((q) => answers[q.id] === q.correct_option).length;
    const subPct     = subQs.length > 0 ? Math.round((subCorrect / subQs.length) * 100) : 0;
    return { subject: sub, correct: subCorrect, total: subQs.length, pct: subPct };
  });

  const filteredQs = questions.filter((q) => {
    if (corrFilter === "correct") return correctIds.includes(q.id);
    if (corrFilter === "wrong")   return wrongIds.includes(q.id);
    if (corrFilter === "skipped") return skippedIds.includes(q.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] font-sans pb-10">
      
      {/* ── HERO ───────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#0d2c08] via-[#1a4a10] to-[#0e3208] pt-14 pb-8 px-5 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute -top-[60px] -left-[60px] w-[220px] h-[220px] rounded-full bg-radial-gradient from-[rgba(90,200,72,0.2)] to-transparent pointer-events-none" />
        <div className="absolute -bottom-[40px] -right-[40px] w-[180px] h-[180px] rounded-full bg-radial-gradient from-[rgba(61,120,48,0.25)] to-transparent pointer-events-none" />

        <div className={`relative flex items-center justify-center mb-5 transition-all duration-700 ease-out ${ringAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.8]'}`}>
          <ScoreRing percentage={ringAnimated ? percentage : 0} color={grade.color} />
          <div className="absolute flex flex-col items-center">
            <span className="text-[44px] font-black text-white font-serif leading-none">
              {percentage}<span className="text-lg text-white/60">%</span>
            </span>
            <p className="text-[11px] text-white/45 mt-0.5 font-medium">{score} / {total} correct</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-[20px] px-3.5 py-1.5 mb-2.5 text-[13px] font-bold border border-white/20" style={{ background: `${grade.color}22`, color: grade.color }}>
          <span>{grade.emoji}</span>
          <span>{grade.label}</span>
        </div>

        <h2 className={`text-[22px] font-black text-white font-serif leading-tight mb-1.5 transition-all duration-500 delay-500 ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          {subjects.join(" · ")}
        </h2>
        <p className={`text-[12.5px] text-white/65 leading-relaxed max-w-[280px] transition-all duration-500 delay-[650ms] ${heroRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
          {moti}
        </p>
      </div>

      {/* ── BODY ───────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-5">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border-[1.5px] border-green-300 dark:border-green-800/30 bg-green-50 dark:bg-green-900/12 p-3 text-center">
            <p className="font-serif text-[26px] font-black leading-none mb-1 text-green-600">{correctIds.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">✓ Correct</p>
          </div>
          <div className="rounded-2xl border-[1.5px] border-red-300 dark:border-red-800/30 bg-red-50 dark:bg-red-900/12 p-3 text-center">
            <p className="font-serif text-[26px] font-black leading-none mb-1 text-red-600">{wrongIds.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">✗ Wrong</p>
          </div>
          <div className="rounded-2xl border-[1.5px] border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 text-center">
            <p className="font-serif text-[26px] font-black leading-none mb-1 text-gray-500">{skippedIds.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">— Skipped</p>
          </div>
        </div>

        {/* Subject Breakdown */}
        {subjectBreakdown.length > 1 && (
          <div>
            <p className="font-serif text-base font-bold text-[#1a3312] dark:text-[#d8f0c8] mb-2.5">By Subject</p>
            <div className="flex flex-col gap-2.5">
              {subjectBreakdown.map((s) => {
                const barColor = s.pct >= 70 ? "#5a9e48" : s.pct >= 50 ? "#f59e0b" : "#ef4444";
                return (
                  <div className="bg-white dark:bg-[#111e0f] border border-green-900/10 dark:border-green-900/15 rounded-2xl p-3" key={s.subject}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[13px] font-semibold text-[#1a3312] dark:text-[#c8e8b8]">{s.subject}</p>
                      <span className="font-serif text-base font-bold" style={{ color: barColor }}>{s.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-green-900/10 dark:bg-green-900/15 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${s.pct}%`, background: barColor }} />
                    </div>
                    <p className="text-[11px] text-[#9ab88a] mt-1 font-medium">{s.correct} / {s.total} correct</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Original Action Buttons */}
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate("/cbt")}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
            }
          >
            Try Again
          </Button>
          <Button
            fullWidth
            onClick={() => setShowCorrections(!showCorrections)}
            rightIcon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d={showCorrections ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}/>
              </svg>
            }
          >
            {showCorrections ? "Hide" : "View"} Corrections
          </Button>
        </div>

        {/* Corrections Section */}
        {showCorrections && (
          <div className="flex flex-col gap-4">
            <p className="font-serif text-base font-bold text-[#1a3312] dark:text-[#d8f0c8]">Corrections</p>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3">
                {[
                  { key: "all",     label: `All (${questions.length})` ,cls: "" },
                  { key: "wrong",   label: `Wrong (${wrongIds.length})`,   cls: "fp-wrong" },
                  { key: "correct", label: `Correct (${correctIds.length})`, cls: "fp-correct" },
                  { key: "skipped", label: `Skipped (${skippedIds.length})`, cls: "fp-skipped" },
                ].map(({ key, label  }) => (
                  <button
                    key={key}
                    onClick={() => setCorrFilter(key)}
                    className={`
                      px-3.5 py-1.5 rounded-[20px] border-[1.5px] text-[11.5px] font-semibold flex-shrink-0 transition-all font-sans
                      ${corrFilter === key 
                        ? (key === "wrong" ? "bg-[#dc2626] border-[#dc2626] text-white" : 
                          key === "correct" ? "bg-[#16a34a] border-[#16a34a] text-white" : 
                          key === "skipped" ? "bg-[#6b7280] border-[#6b7280] text-white" : 
                          "bg-[#5a9e48] border-[#5a9e48] text-white") 
                        : "bg-white dark:bg-[#111e0f] border-[rgba(90,158,72,0.18)] text-[#4a6e42] dark:text-[#7ac86a]"
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>

            {!isPremium && (
              <div className="bg-gradient-to-br from-green-900/8 to-green-900/5 border-[1.5px] border-green-900/25 rounded-[18px] p-5 text-center mb-3">
                <div className="text-[28px] mb-1.5">🔐</div>
                <p className="font-serif text-lg font-bold text-[#1a3312] dark:text-[#d8f0c8] mb-1">Explanations are Premium</p>
                <p className="text-[12.5px] text-[#5a7e4e] leading-relaxed mb-3.5">Upgrade to see why each answer is correct — the fastest way to actually improve your score.</p>
                <Button fullWidth>Unlock Explanations — ₦2,500</Button>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {filteredQs.length === 0 ? (
                <p className="text-center text-[13px] text-[#9ab88a] py-5">No questions in this filter.</p>
              ) : (
                filteredQs.map((q) => (
                  <CorrectionBox
                    key={q.id}
                    question={q}
                    selectedOption={answers[q.id] ?? null}
                    questionNumber={questions.indexOf(q) + 1}
                    showExplanation={isPremium}
                  />
                ))
              )}
            </div>
          </div>
        )}

        <Button variant="ghost" fullWidth onClick={() => navigate("/home")}>
          ← Back to Home
        </Button>

      </div>
    </div>
  );
}