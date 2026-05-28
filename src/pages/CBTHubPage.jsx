import { useContext, useState, useEffect } from "react"; 
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { SchoolContext } from "../context/SchoolContext";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import BottomNav from "../components/ui/BottomNav";
import { HiLightningBolt, HiBookOpen, HiCheckCircle } from "react-icons/hi";

const SUBJECTS_BY_SCHOOL = {
  UI: [
    "English", "Mathematics", "Biology", "Chemistry",
    "Physics", "Economics", "Government", "Literature in English",
  ],
  UNILAG: [
    "English", "Mathematics", "Biology", "Chemistry",
    "Physics", "Economics", "Government", "Literature",
    "Commerce",
  ],
  OAU: [
    "Aptitude", "Mathematics", "Biology", "Chemistry",
    "Physics", "Economics", "Government", "Literature", "Geography"
  ],
};

const DURATION_OPTIONS = [
  { label: "20m", value: 1200 },
  { label: "40m", value: 2400 },
  { label: "1h", value: 3600 },
  { label: "1h 30m", value: 5400 },
  { label: "2h", value: 7200 },
];

const QUESTION_OPTIONS = [20, 40, 60, 100];

const SUBJECT_EMOJIS = {
  "English Language": "📝", "Mathematics": "📐", "Biology": "🧬",
  "Chemistry": "🧪", "Physics": "⚡", "Economics": "📈",
  "Government": "🏛", "Literature in English": "📖", "Geography": "🌍",
  "History": "📜", "Agricultural Science": "🌱", "Further Mathematics": "∑",
  "Commerce": "🏪", "Accounting": "🧾", "Civic Education": "🤝", "Yoruba": "🗣",
};

export default function CBTHubPage() {
  const { isPremium } = useAuth();
  const { selectedSchool } = useContext(SchoolContext);
  const navigate = useNavigate();
  const location = useLocation();

  const availableSubjects = SUBJECTS_BY_SCHOOL[selectedSchool] || SUBJECTS_BY_SCHOOL.UI;

  const [mode, setMode] = useState("test"); 
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [duration, setDuration] = useState(1200); 
  const [questionCount, setQuestionCount] = useState(20); 
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  useEffect(() => {
    if (!isPremium && questionCount !== 20) {
      setQuestionCount(20);
      setDuration(1200); 
    }
  }, [isPremium, questionCount]);

  useEffect(() => {
    const incomingMode = location.state?.mode;
    
    if (incomingMode === "study") {
      if (!isPremium) {
        setMode("test"); 
        setShowPremiumGate(true); 
      } else {
        setMode("study");
      }
    } else if (incomingMode === "test") {
      setMode("test");
    }
  }, [location.state, isPremium]);

  const canStart = selectedSubjects.length > 0;

  function toggleSubject(sub) {
    setSelectedSubjects((prev) => {
      if (prev.includes(sub)) return prev.filter((s) => s !== sub);
      if (prev.length >= 4) return prev; 
      return [...prev, sub];
    });
  }

  function handleModeSelect(m) {
    if (m === "study" && !isPremium) {
      setShowPremiumGate(true);
      return;
    }
    setMode(m);
  }

  function handleQuestionSelect(count) {
    if (!isPremium && count !== 20) {
      setShowPremiumGate(true);
      return;
    }
    setQuestionCount(count);
    
    if (count === 20) setDuration(1200);
    else if (count === 40) setDuration(2400);
    else setDuration(3600);
  }

  function handleStart() {
    if (!canStart) return;
    navigate("/cbt/session", {
      state: { 
        mode, 
        subjects: selectedSubjects, 
        school: selectedSchool, 
        durationSeconds: mode === "test" ? duration : null, 
        questionCount 
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] font-sans pb-40">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0d1a0c]/80 backdrop-blur-md border-b border-green-900/5 px-4 pt-4 pb-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-black text-[#1a3312] dark:text-[#d8f0c8] font-serif tracking-tight">CBT Hub</h1>
          <p className="text-[10px] font-bold text-[#6a9e5e] dark:text-[#4a6e42] uppercase tracking-widest">{selectedSchool} • Configure Session</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-5 space-y-8">
        
        {/* Mode Selection */}
        <section className="space-y-3">
          <label className="text-[11px] font-black text-[#6a9e5e] uppercase tracking-widest ml-1">Practice Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <ModeCard 
              active={mode === 'test'} 
              onClick={() => handleModeSelect('test')}
              title="Test Mode"
              desc="Timed session with results at the end."
              icon={<HiLightningBolt />}
              color="green"
            />
            <ModeCard 
              active={mode === 'study'} 
              onClick={() => handleModeSelect('study')}
              title="Study Mode"
              desc="Instant feedback & explanations."
              icon={<HiBookOpen />}
              color="blue"
              locked={!isPremium}
            />
          </div>
        </section>

        {/* Subjects Grid */}
        <section className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <label className="text-[11px] font-black text-[#6a9e5e] uppercase tracking-widest">Subjects</label>
            <span className="text-[10px] font-bold text-[#3d7830] bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              {selectedSubjects.length}/4 Selected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableSubjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub);
              const isLimitReached = !isSelected && selectedSubjects.length >= 4;
              
              return (
                <button
                  key={sub}
                  onClick={() => toggleSubject(sub)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left active:scale-95 ${
                    isSelected 
                      ? "bg-green-500 border-green-600 shadow-md translate-y-[-1px]" 
                      : "bg-white dark:bg-[#111e0f] border-green-900/10 dark:border-[#1f3319]"
                  } ${isLimitReached ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}
                >
                  <span className="text-lg">{SUBJECT_EMOJIS[sub] || "📚"}</span>
                  <span className={`text-xs font-bold flex-1 leading-tight ${isSelected ? "text-white" : "text-[#1a3312] dark:text-[#d8f0c8]"}`}>
                    {sub}
                  </span>
                  {isSelected && <HiCheckCircle className="text-white text-lg" />}
                </button>
              );
            })}
          </div>
          {selectedSubjects.length >= 4 && (
             <p className="text-center text-[10px] font-bold text-orange-600/70 dark:text-orange-400/50 uppercase tracking-tight">Maximum of 4 subjects reached</p>
          )}
        </section>

        {/* Settings (Questions/Duration) */}
        <div className="grid grid-cols-1 gap-6">
          <section className="space-y-3">
            <label className="text-[11px] font-black text-[#6a9e5e] uppercase tracking-widest ml-1">Questions</label>
            <div className="flex flex-wrap gap-2">
              {QUESTION_OPTIONS.map(q => {
                const isLockedOption = !isPremium && q !== 20;
                return (
                  <Pill 
                    key={q} 
                    active={questionCount === q} 
                    onClick={() => handleQuestionSelect(q)} 
                    label={isLockedOption ? `${q} Qs 🔒` : `${q} Qs`} 
                    disabled={isLockedOption}
                  />
                );
              })}
            </div>
            {!isPremium && (
              <p className="text-[10px] font-bold text-[#6a9e5e]/80 dark:text-[#9ab88a]/50 italic ml-1 mt-1.5">
                💡 Free Tier: Limited to 20-question. Shuffling and higher volumes require activation.
              </p>
            )}
          </section>

          {mode === 'test' && (
            <section className="space-y-3">
              <label className="text-[11px] font-black text-[#6a9e5e] uppercase tracking-widest ml-1">Time Limit</label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map(d => {
                  const isDurationDisabled = !isPremium && d.value > 2400;
                  return (
                    <Pill 
                      key={d.value} 
                      active={duration === d.value} 
                      onClick={() => !isDurationDisabled && setDuration(d.value)} 
                      label={d.label} 
                      disabled={isDurationDisabled}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-[65px] left-0 right-0 p-4 bg-white/90 dark:bg-[#0b160a]/90 backdrop-blur-xl border-t border-green-900/10 z-40 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-[#6a9e5e] uppercase tracking-tighter">Ready to start?</p>
            <p className="text-xs font-bold text-[#1a3312] dark:text-white truncate">
              {selectedSubjects.length > 0 ? selectedSubjects.join(", ") : "Select subjects..."}
            </p>
          </div>
          <Button 
            onClick={handleStart} 
            disabled={!canStart} 
            size="lg" 
            className={`px-8 shadow-xl transition-all duration-200 ${canStart ? "opacity-100 shadow-green-900/20" : "opacity-40 cursor-not-allowed"}`}
          >
            START SESSION
          </Button>
        </div>
      </footer>

      <BottomNav />

      {/* Premium Gate */}
      <Modal isOpen={showPremiumGate} onClose={() => setShowPremiumGate(false)}>
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-black text-[#1a3312] dark:text-white font-serif mb-2">Premium Feature Locked</h2>
          <p className="text-sm text-green-800/60 dark:text-green-200/60 mb-6 px-4">
            Unlock Study Mode explanations, advanced question sizes up to 100 entries, and complete dynamic shuffles with a lifetime activation for just ₦2,000.
          </p>
          <Button className="w-full" onClick={() => { setShowPremiumGate(false); navigate("/premium"); }}>
            Upgrade to Unlock
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ── Shared UI Components ───────────────────────────────────────

function ModeCard({ active, onClick, title, desc, icon, color, locked }) {
  const isGreen = color === 'green';
  return (
    <button 
      onClick={onClick}
      className={`relative p-4 rounded-3xl border-2 text-left transition-all active:scale-95 ${
        active 
        ? (isGreen ? "bg-green-50 border-green-500" : "bg-blue-50 border-blue-500") 
        : "bg-white dark:bg-[#111e0f] border-green-900/5 dark:border-[#1f3319]"
      }`}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-3 ${
        active 
        ? (isGreen ? "bg-green-500 text-white" : "bg-blue-500 text-white") 
        : "bg-green-900/5 dark:bg-white/5 text-green-600"
      }`}>
        {icon}
      </div>
      <p className={`text-sm font-black ${active ? "text-black" : "text-[#1a3312] dark:text-white"}`}>
        {title}
      </p>
      <p className={`text-[10px] leading-tight mt-1 ${active ? "text-black/70" : "text-green-800/60 dark:text-green-200/40"}`}>
        {desc}
      </p>
      {locked && <span className="absolute top-4 right-4 text-xs">🔒</span>}
    </button>
  );
}

function Pill({ active, label, onClick, disabled }) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
        active 
        ? "bg-[#3d7830] text-white shadow-lg" 
        : disabled
          ? "bg-gray-100 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-pointer"
          : "bg-white dark:bg-[#111e0f] border border-green-900/10 dark:border-[#1f3319] text-[#1a3312] dark:text-[#d8f0c8]"
      }`}
    >
      {label}
    </button>
  );
}