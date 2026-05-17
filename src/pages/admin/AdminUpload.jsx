import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { parseQuestionsCSV } from "../../lib/csvParser";
import AdminLayout from "./AdminLayout";

export default function AdminUpload() {
  const [questions, setQuestions] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState(null);

  // ── CUSTOM MODAL SYSTEM STATE ──────────────────────────────────────
  const [modal, setModal] = useState({ isOpen: false, type: "", title: "", message: "" });

  // 1. Process local file selection and generate preview arrays
  async function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessCount(null);
    setQuestions([]);
    setPreviewRows([]);
    setFileName(file.name);

    try {
      const parsedResults = await parseQuestionsCSV(file);
      setQuestions(parsedResults);
      // Slice out the first 30 rows strictly for mobile UI rendering stability
      setPreviewRows(parsedResults.slice(0, 30));
    } catch (err) {
      const msg = err.message || "An error occurred while parsing your template.";
      setErrorMsg(msg);
      setFileName("");
      setModal({
        isOpen: true,
        type: "error",
        title: "Parsing Failed",
        message: msg
      });
    }
  }

  // 2. Stream mass batch upload to Supabase questions table
  async function handleBatchUpload() {
    if (questions.length === 0) return;

    setUploading(true);
    setErrorMsg("");
    setSuccessCount(null);

    try {
      const chunkSize = 1000;
      let rowsInserted = 0;

      for (let i = 0; i < questions.length; i += chunkSize) {
        const chunk = questions.slice(i, i + chunkSize);
        
        const { error } = await supabase
          .from("questions")
          .insert(chunk);

        if (error) throw error;
        rowsInserted += chunk.length;
      }

      setSuccessCount(rowsInserted);
      setQuestions([]);
      setPreviewRows([]);
      setFileName("");
      
      setModal({
        isOpen: true,
        type: "success",
        title: "Ingestion Success",
        message: `Hooray! ${rowsInserted} question profiles have been completely cataloged into the database ecosystem.`
      });
    } catch (err) {
      const msg = `Database ingestion crashed: ${err.message}`;
      setErrorMsg(msg);
      setModal({
        isOpen: true,
        type: "error",
        title: "Upload Interrupted",
        message: msg
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="font-serif text-lg font-bold text-[#1a3312] dark:text-[#d8f0c8]">
            Question Batch Bulk Ingestion
          </h2>
          <p className="text-xs text-[#5a7e4e] dark:text-gray-400">
            Populate your app question banks dynamically using standard format CSV templates.
          </p>
        </div>

        {/* ── 📥 FILE DROPZONE PANEL (MOBILE OPTIMIZED STACK) ──────────── */}
        <section className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col gap-4 shadow-xs">
          
          {/* Native-feeling Interactive Input Dropzone */}
          <div className="border-2 border-dashed border-green-900/20 dark:border-emerald-900/40 hover:border-emerald-500 rounded-xl p-6 bg-green-900/5 dark:bg-[#0d1f0e] text-center transition relative cursor-pointer group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelection}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-2xl group-hover:scale-110 transition duration-200">📊</span>
              <p className="text-xs font-bold text-[#1a3312] dark:text-white break-all px-2">
                {fileName ? fileName : "Tap to choose Questions CSV"}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                Supports standard comma delimited rows
              </p>
            </div>
          </div>

          {/* Policy Information Flag */}
          <div className="text-[11px] text-[#4a6e42] dark:text-gray-400 leading-relaxed bg-green-900/5 dark:bg-[#0d1f0e] p-3 rounded-xl border border-green-900/5 dark:border-emerald-900/20">
            <strong className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mb-0.5 text-[10px]">
              Database Policy Defaults:
            </strong>
            Bypasses premium parameter mapping and maps strictly to <code className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded font-mono text-[10px]">is_free = false</code>.
          </div>

          {/* Action Trigger */}
          {questions.length > 0 && (
            <button
              onClick={handleBatchUpload}
              disabled={uploading}
              className="w-full py-3 bg-[#5a9e48] dark:bg-emerald-600 hover:bg-green-600 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs active:scale-[0.99] disabled:opacity-40"
            >
              {uploading ? "Ingesting Database Entries..." : `🚀 Execute Batch Upload (${questions.length} Items)`}
            </button>
          )}

          {/* Static Validation In-Line Fallbacks */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-[10px] font-mono text-red-600 dark:text-red-400">
              ❌ {errorMsg}
            </div>
          )}

          {successCount && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              🎉 Success! Registered {successCount} question entries.
            </div>
          )}
        </section>

        {/* ── 👁️ HORIZONTAL DATA DECK PREVIEW (MOBILE GRID) ─────────────── */}
        {previewRows.length > 0 && (
          <section className="space-y-2">
            <div className="px-1">
              <h3 className="font-serif text-xs font-bold text-[#1a3312] dark:text-gray-200 flex items-center gap-1.5">
                <span>🔎</span> Pre-Upload Sample Check
              </h3>
              <p className="text-[10px] text-[#5a7e4e] dark:text-gray-400">
                Swipe horizontally to review the first {previewRows.length} question blocks before deployment.
              </p>
            </div>

            {/* Horizontal Touch-Swipe Canvas Wrapper */}
            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin">
              {previewRows.map((row, idx) => (
                <div 
                  key={idx}
                  className="w-[280px] shrink-0 bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/30 rounded-2xl p-4 snap-center flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-2">
                    {/* Meta Identifiers header */}
                    <div className="flex items-center justify-between border-b border-green-900/5 dark:border-emerald-900/20 pb-1.5 text-[10px]">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase truncate max-w-[120px]">
                        {row.school || "No School"}
                      </span>
                      <span className="font-medium text-[#1a3312] dark:text-white truncate max-w-[120px]">
                        {row.subject || "No Subject"}
                      </span>
                    </div>

                    {/* Question Statement Body */}
                    <p className="text-xs font-bold text-[#1a3312] dark:text-gray-200 line-clamp-3">
                      {row.question_text}
                    </p>

                    {/* Multiple Choice Options Grid block */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400 dark:text-gray-400 font-mono">
                      <div className="truncate bg-green-900/5 dark:bg-black/20 p-1.5 rounded-md">
                        <span className="text-[#4a6e42] font-bold">A:</span> {row.option_a}
                      </div>
                      <div className="truncate bg-green-900/5 dark:bg-black/20 p-1.5 rounded-md">
                        <span className="text-[#4a6e42] font-bold">B:</span> {row.option_b}
                      </div>
                      <div className="truncate bg-green-900/5 dark:bg-black/20 p-1.5 rounded-md">
                        <span className="text-[#4a6e42] font-bold">C:</span> {row.option_c}
                      </div>
                      <div className="truncate bg-green-900/5 dark:bg-black/20 p-1.5 rounded-md">
                        <span className="text-[#4a6e42] font-bold">D:</span> {row.option_d}
                      </div>
                    </div>
                  </div>

                  {/* Key answers and explanations footer */}
                  <div className="space-y-2 pt-2 border-t border-green-900/5 dark:border-emerald-900/20">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400">Correct Choice:</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 rounded-md font-mono font-bold">
                        {row.correct_option}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-400 italic line-clamp-2 leading-tight">
                      {row.explanation ? row.explanation : "No extra explanations given."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {questions.length > 30 && (
              <p className="text-[9px] text-center text-[#9ab88a] font-mono">
                ...plus {questions.length - 30} additional cards are staged in cache.
              </p>
            )}
          </section>
        )}
      </div>

      {/* ── DIAGNOSTIC FEEDBACK MODAL DIALOG DISPLAY ─────────────────── */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/50 rounded-2xl p-5 shadow-2xl animate-in scale-in duration-150">
            <h4 className={`font-serif text-sm font-bold mb-1.5 ${
              modal.type === "error" ? "text-red-500" : "text-[#1a3312] dark:text-emerald-400"
            }`}>
              {modal.title}
            </h4>
            <p className="text-xs text-[#4a6e42] dark:text-gray-300 leading-relaxed mb-4">
              {modal.message}
            </p>
            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="px-4 py-2 w-full text-center rounded-xl text-[11px] font-bold bg-[#5a9e48] dark:bg-emerald-600 text-white shadow-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}