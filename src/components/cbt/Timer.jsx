import { useEffect, useRef, useState } from "react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Timer({
  durationSeconds = 3600,
  onExpire,
  onTick,
  isPaused = false,
  compact = false,
}) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const intervalRef = useRef(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  useEffect(() => {
    onTick?.(secondsLeft);
    if (secondsLeft <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
    }
  }, [secondsLeft]);

  const pct = secondsLeft / durationSeconds;
  const isDanger = pct <= 0.10; // Red at 10% remaining

  // Minimalist Logic
  const textStyles = isDanger 
    ? "text-red-600 dark:text-red-500 animate-pulse font-black" 
    : "text-green-700 dark:text-green-400 font-bold";

  const containerStyles = isDanger
    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40"
    : "bg-green-900/5 dark:bg-white/5 border-green-900/10 dark:border-white/10";

  if (compact) {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-xl border transition-colors duration-500 ${containerStyles}`}>
        <span className={`text-[13px] tabular-nums tracking-tight ${textStyles}`}>
          {formatTime(secondsLeft)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <span className={`text-xl tabular-nums tracking-tighter ${textStyles}`}>
        {formatTime(secondsLeft)}
      </span>
      <span className={`text-[9px] uppercase tracking-[0.2em] font-black opacity-40 ${isDanger ? 'text-red-600' : 'text-green-900 dark:text-green-100'}`}>
        {isDanger ? "Time Critical" : "Time Remaining"}
      </span>
    </div>
  );
}