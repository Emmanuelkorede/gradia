import { HiCheck, HiX, HiLightBulb, HiAcademicCap } from "react-icons/hi";
import QuestionRenderer from "../QuestionRender";

const SUBJECT_THEMES = {
  "Mathematics": { bg: "bg-blue-50/50", darkBg: "dark:bg-blue-900/10", accent: "text-blue-500", border: "border-blue-100", darkBorder: "dark:border-blue-800/30", text: "text-blue-700", darkText: "dark:text-blue-300" },
  "English Language": { bg: "bg-purple-50/50", darkBg: "dark:bg-purple-900/10", accent: "text-purple-500", border: "border-purple-100", darkBorder: "dark:border-purple-800/30", text: "text-purple-700", darkText: "dark:text-purple-300" },
  "Biology": { bg: "bg-green-50/50", darkBg: "dark:bg-green-900/10", accent: "text-green-500", border: "border-green-100", darkBorder: "dark:border-green-800/30", text: "text-green-700", darkText: "dark:text-green-300" },
  "default": { bg: "bg-emerald-50/50", darkBg: "dark:bg-emerald-900/10", accent: "text-emerald-500", border: "border-emerald-100", darkBorder: "dark:border-emerald-800/30", text: "text-emerald-700", darkText: "dark:text-emerald-300" },
};

const OPTIONS = ["A", "B", "C", "D"];

export default function QuestionCard({
  question = {},
  localNumber = 1,
  localTotal = 1,
  selectedOption = null,
  onSelect,
  mode = "test",
  subject = "",
}) {
  const { id, question_text, options = {}, correct_option, explanation } = question;
  const theme = SUBJECT_THEMES[subject] || SUBJECT_THEMES.default;
  const isStudy = mode === "study";
  const hasAnswered = selectedOption !== null;

return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#111e0f] rounded-2xl border border-green-900/10 dark:border-white/5 shadow-sm overflow-hidden">
      
      {/* Tight Header */}
      <div className="px-4 py-3 border-b border-green-900/5 dark:border-white/5 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${theme.bg} ${theme.darkBg} border ${theme.border} ${theme.darkBorder}`}>
          <HiAcademicCap className={theme.accent} size={12} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text} ${theme.darkText}`}>
            {subject || "General"}
          </span>
        </div>

        <span className="text-[11px] font-bold text-green-900/40 dark:text-white/20">
          {localNumber} / {localTotal}
        </span>
      </div>

      {/* Question Text - Compact Padding */}
      <div className="px-5 py-6">
        <div className="text-[15.5px] font-bold text-[#1a3312] dark:text-[#d8f0c8] font-serif leading-snug">
          {/* 🚀 FIXED: Swapped raw question_text text slot out */}
          <QuestionRenderer text={question_text} />
        </div>
      </div>

      {/* Options - Tight Spacing */}
      <div className="px-4 pb-5 space-y-2">
        {OPTIONS.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrect = isStudy && opt === correct_option;
          const isWrong = isStudy && isSelected && opt !== correct_option;

          let btnStyles = "bg-[#f8fbf5] dark:bg-white/5 border-green-900/5 dark:border-white/5 text-green-900/80 dark:text-green-100/60";
          let labelStyles = "bg-green-900/10 dark:bg-white/10 text-green-800 dark:text-green-400";

          if (isStudy && hasAnswered) {
            if (isCorrect) {
              btnStyles = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300";
              labelStyles = "bg-green-500 text-white";
            } else if (isWrong) {
              btnStyles = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300";
              labelStyles = "bg-red-500 text-white";
            }
          } else if (isSelected) {
            btnStyles = "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300";
            labelStyles = "bg-blue-500 text-white";
          }

          return (
            <button
              key={opt}
              disabled={isStudy && hasAnswered}
              onClick={() => onSelect?.(id, opt)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all active:scale-[0.985] text-left ${btnStyles}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${labelStyles}`}>
                {isStudy && hasAnswered && isCorrect ? <HiCheck size={14} /> : 
                 isStudy && hasAnswered && isWrong ? <HiX size={14} /> : opt}
              </div>
              <div className="text-[13px] font-medium leading-tight w-full">
                {/* 🚀 FIXED: Swapped out individual option string blocks */}
                <QuestionRenderer text={options[opt]} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isStudy && hasAnswered && explanation && (
        <div className="mx-4 mb-5 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30 flex gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
            <HiLightBulb size={14} />
          </div>
          <div className="flex-1">
            <span className="block text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Explanation</span>
            <div className="text-[12px] font-medium text-blue-900/80 dark:text-blue-200/70 leading-relaxed italic">
              {/* 🚀 FIXED: Swapped raw explanation text block out */}
              <QuestionRenderer text={explanation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}