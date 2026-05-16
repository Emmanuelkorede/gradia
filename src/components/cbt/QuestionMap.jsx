import { useMemo } from "react";
import { HiCheckCircle, HiFlag, HiPlay } from "react-icons/hi";

export default function QuestionMap({
  isOpen = false,
  onClose,
  questions = [],
  answers = {},
  currentIndex = 0,
  onJump,
}) {
  const stats = useMemo(() => {
    const answered = Object.keys(answers).length;
    // Group questions by subject for the organized view
    const groups = questions.reduce((acc, q, index) => {
      const subject = q.subject || "General";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push({ ...q, globalIndex: index });
      return acc;
    }, {});

    return {
      answered,
      left: questions.length - answered,
      groups: Object.entries(groups)
    };
  }, [questions, answers]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(5, 15, 5, 0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#0d1a0c] rounded-t-[32px] sm:rounded-[28px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up">
        
        {/* Mobile Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-green-900/10 dark:bg-white/10" />
        </div>

        {/* Header Section */}
        <div className="px-6 pt-4 pb-4 border-b border-green-900/5 dark:border-white/5">
          <h2 className="text-xl font-black text-[#1a3312] dark:text-[#d8f0c8] font-serif tracking-tight mb-4">
            Question Map
          </h2>
          
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon={<HiCheckCircle className="text-green-500" />} label="Done" value={stats.answered} color="green" />
            <StatCard icon={<HiFlag className="text-orange-400" />} label="Left" value={stats.left} color="orange" />
            <StatCard icon={<HiPlay className="text-blue-500" />} label="Active" value={`#${currentIndex + 1}`} color="blue" />
          </div>
        </div>

        {/* Scrollable Grid Section */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {stats.groups.map(([subject, subjectQuestions]) => (
            <div key={subject} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-green-700/40 dark:text-green-400/30 uppercase tracking-[0.2em]">
                  {subject}
                </h3>
                <span className="text-[10px] font-bold text-green-900/30 dark:text-white/20">
                  {subjectQuestions.length} Qs
                </span>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {subjectQuestions.map((q) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isCurrent = q.globalIndex === currentIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => { onJump?.(q.globalIndex); onClose?.(); }}
                      className={`
                        aspect-square rounded-xl text-[11px] font-black transition-all active:scale-90 flex items-center justify-center border-2
                        ${isCurrent 
                          ? "bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110 z-10" 
                          : isAnswered 
                            ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-400"
                            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 dark:text-white/20"
                        }
                      `}
                    >
                      {q.globalIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-gray-50 dark:bg-[#0a1409] border-t border-green-900/5 dark:border-white/5">
          <button 
            onClick={onClose}
            className="w-full h-14 bg-white dark:bg-[#111e0f] border border-green-900/10 dark:border-white/5 rounded-2xl text-[#1a3312] dark:text-white text-sm font-black uppercase tracking-widest shadow-sm active:scale-[0.98] transition-all"
          >
            Back to Test
          </button>
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    green: "bg-green-50 dark:bg-green-900/10",
    orange: "bg-orange-50 dark:bg-orange-900/10",
    blue: "bg-blue-50 dark:bg-blue-900/10"
  };

  return (
    <div className={`${colors[color]} p-3 rounded-2xl flex flex-col items-center justify-center gap-1`}>
      <span className="text-lg">{icon}</span>
      <span className="text-[9px] font-black uppercase text-green-900/40 dark:text-white/30 tracking-tighter">{label}</span>
      <span className="text-sm font-black text-[#1a3312] dark:text-white leading-none">{value}</span>
    </div>
  );
}