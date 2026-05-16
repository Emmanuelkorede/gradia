import { useState } from "react";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  function press(val) {
    if (val === "C") {
      setDisplay("0"); setPrev(null); setOp(null); setFresh(true); return;
    }
    if (val === "⌫") {
      setDisplay((d) => d.length > 1 ? d.slice(0, -1) : "0"); return;
    }
    if (["+", "-", "×", "÷"].includes(val)) {
      setPrev(parseFloat(display)); setOp(val); setFresh(true); return;
    }
    if (val === "=") {
      if (prev === null || !op) return;
      const a = prev, b = parseFloat(display);
      let result = 0;
      if (op === "+") result = a + b;
      if (op === "-") result = a - b;
      if (op === "×") result = a * b;
      if (op === "÷") result = b !== 0 ? a / b : "Error";
      
      setDisplay(typeof result === "number" ? String(parseFloat(result.toFixed(8))) : result);
      setPrev(null); setOp(null); setFresh(true); return;
    }
    if (val === "." && display.includes(".")) return;
    setDisplay((d) => fresh || d === "0" ? (val === "." ? "0." : val) : d + val);
    setFresh(false);
  }

  const BTNS = [
    ["C", "⌫", "÷", "×"],
    ["7", "8", "9", "-"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", "="],
    [".", "0", "00"],
  ];

  return (
    <div className="w-full max-w-[320px] mx-auto font-sans">
      {/* Tightened Display Screen */}
      <div className="bg-[#1a3312] dark:bg-[#050a04] rounded-xl p-3 mb-3 text-right shadow-inner border border-white/5">
        <div className="h-3 text-[9px] font-bold text-green-500/50 uppercase tracking-widest">
          {op ? `${prev} ${op}` : ""}
        </div>
        <div className="text-2xl font-black text-white tabular-nums truncate tracking-tight mt-0.5">
          {display}
        </div>
      </div>

      {/* Tighter Buttons Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {BTNS.map((row, ri) => (
          row.map((btn, bi) => {
            const isOp = ["÷", "×", "-", "+"].includes(btn);
            const isEq = btn === "=";
            const isAction = ["C", "⌫"].includes(btn);
            
            return (
              <button
                key={`${ri}-${bi}`}
                onClick={() => press(btn)}
                className={`
                  h-11 rounded-lg text-xs font-black transition-all active:scale-95
                  ${isEq ? "row-span-2 h-full bg-green-500 text-white shadow-md shadow-green-900/20" : ""}
                  ${isOp ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : ""}
                  ${isAction ? "bg-red-50 dark:bg-red-900/10 text-red-600" : ""}
                  ${!isOp && !isEq && !isAction ? "bg-white dark:bg-white/5 text-[#1a3312] dark:text-[#d8f0c8] border border-green-900/5 dark:border-white/5" : ""}
                `}
              >
                {btn}
              </button>
            );
          })
        ))}
      </div>
    </div>
  );
}