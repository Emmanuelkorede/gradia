import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQuestions } from "../hooks/useQuestions";
import { useTestSession } from "../hooks/useTestSession";
import { useAuth } from "../hooks/useAuth"; // 1. Make sure to import useAuth
import QuestionCard from "../components/cbt/QuestionCard";
import QuestionMap from "../components/cbt/QuestionMap";
import Timer from "../components/cbt/Timer";
import Calculator from "../components/cbt/Calculator";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import ProfileModal from "../components/ui/profileModal"
import { HiChevronLeft, HiCalculator, HiViewGrid, HiArrowRight  , HiX, HiCheckCircle} from "react-icons/hi";

export default function CBTSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPremium } = useAuth(); // 2. Grab premium status from context

  const {
    mode = "test",
    subjects = [],
    school = "UI",
    durationSeconds = 3600,
    questionCount = 40,
  } = location.state ?? {};

  // Redirect if no state
  useEffect(() => {
    if (!location.state) navigate("/cbt", { replace: true });
  }, [location.state, navigate]);

  const { questions, loading } = useQuestions({
    school, 
    subjects, 
    limit: questionCount, 
    enabled: subjects.length > 0,
    isPremium, 
  });

  const session = useTestSession({
    questions, mode, school, durationSeconds: durationSeconds ?? 3600,
  });

  const [mapOpen, setMapOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [slideDir, setSlideDir] = useState("right");

  const q = session.currentQuestion;

  const subjectProgress = useMemo(() => {
    if (!questions.length || !q) return { localNumber: 1, localTotal: 1 };
    const subjectGroup = questions.filter(item => item.subject === q.subject);
    const localIndex = subjectGroup.findIndex(item => item.id === q.id);
    return { localNumber: localIndex + 1, localTotal: subjectGroup.length };
  }, [questions, q]);

  useEffect(() => {
    if (session.isFinished && session.result) {
      navigate("/cbt/result", {
        state: { result: session.result, questions, answers: session.answers, mode, school, subjects },
        replace: true,
      });
    }
  }, [session.isFinished, session.result, navigate, questions, session.answers, mode, school, subjects]);

  function handleNav(dir) {
    setSlideDir(dir === "next" ? "left" : "right");
    dir === "next" ? session.goNext() : session.goPrev();
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] flex flex-col items-center justify-center gap-4">
      <Spinner size={40} color="green" />
      <p className="text-xs font-bold text-[#6a9e5e] uppercase tracking-widest animate-pulse">Assembling Session...</p>
    </div>
  );

 return (
    <div className="min-h-screen bg-[#f8faf7] dark:bg-[#0b160a] font-sans flex flex-col pb-28">
      
      {/* ── HEADER: Timer & Quit ────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0d1a0c]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-green-900/5">
        {mode === "test" && (
          <Timer 
            durationSeconds={durationSeconds} 
            compact 
            isPaused={calcOpen || mapOpen || exitConfirmOpen || confirmOpen}
            onExpire={session.handleTimerExpire}
            onTick={session.handleTimerTick}
          />
        )}
        
        <button 
          onClick={() => setExitConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95"
        >
          <HiX size={14} />
          Quit
        </button>
      </header>

      {/* ── UTILITY BAR: Calculator & Submit ────────────────────── */}
      <div className="px-4 pt-4 flex items-center justify-between gap-3">
        <button 
          onClick={() => setCalcOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-green-900/5 text-green-700 dark:text-green-400 shadow-sm active:scale-95 transition-all"
        >
          <HiCalculator size={18} />
          <span className="text-xs font-bold uppercase tracking-tight">Calculator</span>
        </button>

        {mode === "test" && (
          <button 
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-600 text-white shadow-lg shadow-green-900/20 active:scale-95 transition-all"
          >
            <HiCheckCircle size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Submit Test</span>
          </button>
        )}
      </div>

      {/* ── SUBJECT DISPLAY ─────────────────────────────────────── */}
      <div className="px-4 mt-6">
        <p className="text-[10px] font-black text-green-900/30 dark:text-white/20 uppercase tracking-[0.2em] mb-1">Active Subjects</p>
        <p className="text-xs font-bold text-green-700 dark:text-green-400 italic">
          {subjects.join(" • ")}
        </p>
      </div>

      {/* ── BODY ───────────────────────────────────────────────── */}
      <main className="flex-1 px-4 pt-4">
        {q ? (
          <div key={session.currentIndex} className={`transition-all duration-300 transform ${slideDir === 'left' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
            <QuestionCard
              question={q}
              localNumber={subjectProgress.localNumber}
              localTotal={subjectProgress.localTotal}
              selectedOption={session.answers[q.id] ?? null}
              onSelect={session.selectAnswer}
              mode={mode}
              subject={q.subject}
            />
          </div>
        ) : (
          <div className="text-center py-20 opacity-40">
            <HiViewGrid size={48} className="mx-auto mb-4" />
            <p className="font-serif font-bold italic">No questions loaded.</p>
          </div>
        )}
      </main>

      {/* ── NAVIGATION FOOTER ──────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#0b160a]/80 backdrop-blur-xl border-t border-green-900/10 flex items-center justify-between gap-3 safe-bottom">
        <Button variant="secondary" onClick={() => handleNav("prev")} disabled={!session.canGoPrev} className="flex-1 !rounded-2xl">
          Prev
        </Button>

        <button onClick={() => setMapOpen(true)} className="flex-[1.5] h-12 flex flex-col items-center justify-center rounded-2xl bg-green-900/5 dark:bg-white/5 text-green-800 dark:text-green-200 active:scale-95 transition-all">
          <HiViewGrid size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">{session.answeredCount} / {session.totalQuestions}</span>
        </button>

        <Button onClick={() => handleNav("next")} disabled={!session.canGoNext} className="flex-1 !rounded-2xl">
          Next
        </Button>
      </footer>

      {/* ── MODALS ─────────────────────────────────────────────── */}
      
      {/* QUIT CONFIRMATION */}
      <Modal isOpen={exitConfirmOpen} onClose={() => setExitConfirmOpen(false)} title="Exit Session?">
        <div className="text-center py-4">
          <p className="text-sm text-green-900/60 dark:text-green-100/60 leading-relaxed mb-8">
            Your progress will not be saved. Are you sure you want to quit this session and return to the dashboard?
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="danger" className="w-full" onClick={() => navigate("/cbt")}>Yes, Quit Session</Button>
            <Button variant="ghost" className="w-full" onClick={() => setExitConfirmOpen(false)}>Continue Practice</Button>
          </div>
        </div>
      </Modal>

      {/* SUBMIT CONFIRMATION */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Finish Test?">
        <div className="text-center py-2">
          <p className="text-sm text-green-900/60 dark:text-green-100/60 leading-relaxed">
            You've completed <span className="font-black text-[#1a3312] dark:text-white">{session.answeredCount}</span> out of {session.totalQuestions} questions.
          </p>
          {session.totalQuestions - session.answeredCount > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 text-[11px] font-bold text-orange-700 leading-tight">
              ⚠️ {session.totalQuestions - session.answeredCount} questions are still unanswered.
            </div>
          )}
          <div className="mt-8 flex flex-col gap-2">
            <Button className="w-full" onClick={() => { setConfirmOpen(false); session.submitTest(); }}>Yes, Submit Test</Button>
            <Button variant="ghost" className="w-full" onClick={() => setConfirmOpen(false)}>No, Keep Going</Button>
          </div>
        </div>
      </Modal>

      <QuestionMap 
        isOpen={mapOpen} onClose={() => setMapOpen(false)} questions={questions} 
        answers={session.answers} currentIndex={session.currentIndex} 
        onJump={(i) => { session.jumpTo(i); setMapOpen(false); }} mode={mode} 
      />

      <ProfileModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} title="Scientific Tool">
        <Calculator />
      </ProfileModal>
    </div>
  );
}

