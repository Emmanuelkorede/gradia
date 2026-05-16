import { useState } from "react";

export default function CorrectionBox({
  question         = {},
  selectedOption   = null,
  questionNumber   = 1,
  showExplanation  = false,
}) {
  const { question_text, options = {}, correct_option, explanation } = question;
  const [expOpen, setExpOpen] = useState(false);

  const isCorrect  = selectedOption === correct_option;
  const isSkipped  = selectedOption === null;

  // ── Box theme logic ────────────────────────────────────────────
  const theme = isCorrect
    ? {
        border: "border-green-300 dark:border-green-800/40",
        bg:     "bg-[#f0fdf4] dark:bg-green-900/10",
        accent: "text-green-600 dark:text-green-500",
        labelBg: "bg-green-600/10",
        label:  "Correct",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
            <path d="M8 12l3 3 5-5"/>
          </svg>
        ),
      }
    : isSkipped
    ? {
        border: "border-gray-300 dark:border-white/10",
        bg:     "bg-[#f9fafb] dark:bg-white/5",
        accent: "text-gray-500 dark:text-gray-400",
        labelBg: "bg-gray-500/10",
        label:  "Skipped",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        ),
      }
    : {
        border: "border-red-300 dark:border-red-800/40",
        bg:     "bg-[#fff5f5] dark:bg-red-900/10",
        accent: "text-red-600 dark:text-red-500",
        labelBg: "bg-red-600/10",
        label:  "Wrong",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        ),
      };

  return (
    <div className={`rounded-[18px] border-[1.5px] overflow-hidden transition-shadow duration-200 hover:shadow-lg hover:shadow-black/5 ${theme.border} ${theme.bg}`}>
      
      {/* Header */}
      <div className={`flex items-center gap-2 px-3.5 py-2.5 border-b border-inherit bg-inherit`}>
        {theme.icon}
        <span className={`text-[10px] font-bold tracking-wider ${theme.accent}`}>
          Q{questionNumber}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${theme.labelBg} ${theme.accent}`}>
          {theme.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-3">
        <p className={`font-serif text-[13.5px] font-bold leading-relaxed ${isCorrect ? "text-green-900 dark:text-green-100" : isSkipped ? "text-gray-800 dark:text-gray-200" : "text-red-900 dark:text-red-100"}`}>
          {question_text}
        </p>

        <div className="flex flex-col gap-1.5">
          {["A", "B", "C", "D"].map((opt) => {
            const isThisCorrect = opt === correct_option;
            const isThisSelected = opt === selectedOption;

            // Only show relevant options to save vertical space
            if (!isThisCorrect && !isThisSelected) return null;

            let styles = "bg-transparent text-gray-500";
            if (isThisCorrect) styles = "bg-green-100 dark:bg-green-600/20 border-green-300 dark:border-green-600/40 text-green-900 dark:text-green-300";
            else if (isThisSelected && !isThisCorrect) styles = "bg-red-100 dark:bg-red-600/20 border-red-300 dark:border-red-600/40 text-red-900 dark:text-red-300";

            return (
              <div key={opt} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-semibold ${styles}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${isThisCorrect ? 'bg-green-600 text-white' : isThisSelected ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-600'}`}>
                  {opt}
                </div>
                <span className="flex-1">{options[opt]}</span>
                {isThisCorrect && (
                  <svg className="flex-shrink-0 text-green-600" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation Gate */}
      {showExplanation && explanation && (
        <div className="border-t border-inherit">
          <button
            className="flex items-center gap-2 w-full px-3.5 py-2.5 text-left text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 transition-colors"
            onClick={() => setExpOpen(!expOpen)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            View Explanation
            <svg
              className={`ml-auto transition-transform duration-200 ${expOpen ? "rotate-180" : ""}`}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {expOpen && (
            <div className="px-3.5 py-3 bg-blue-50/50 dark:bg-blue-500/10 border-t border-inherit flex gap-2">
              <div className="w-5 h-5 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <p className="text-xs text-blue-900/80 dark:text-blue-300 leading-relaxed font-medium">
                {explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}