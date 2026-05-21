import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "./AdminLayout";

export default function AdminPremium() {
  const [submissions, setSubmissions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // --- Mobile Dialog Modal States ---
  const [modal, setModal] = useState({ isOpen: false, type: "", title: "", message: "", targetId: null, targetSubId: null });

  useEffect(() => {
    fetchPremiumData();
  }, []);

  async function fetchPremiumData() {
    try {
      setLoading(true);

      // 1. Fetch Pending Receipt Submissions
      const { data: submissionData, error: subError } = await supabase
        .from("premium_submissions")
        .select("*, profiles(email)")
        .eq("status", "Pending")
        .order("created_at", { ascending: false });

      if (subError) throw subError;

      const processedSubmissions = (submissionData || []).map((sub) => {
  const { data } = supabase.storage
    .from("payment_receipts")
    .getPublicUrl(sub.image_path);
  
  return { ...sub, computed_url: data?.publicUrl || "" };
});
setSubmissions(processedSubmissions);

      // 2. Fetch Regular Students list for fallback search panel
const { data: profileData, error: profError } = await supabase
  .rpc("get_all_students_for_admin"); // 👈 Calls your secure database pipeline directly

if (profError) throw profError;
setAllStudents(profileData || []);

    } catch (err) {
      console.error("Error loading administration data map:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // Intercept action to call custom modal instead of browser confirm
  function triggerUpgradeConfirmation(studentId, submissionRowId = null) {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Activate Premium Account?",
      message: "Are you sure you want to verify this payment and instantly unlock all premium course modules for this student profile?",
      targetId: studentId,
      targetSubId: submissionRowId
    });
  }

  // Action processor executing after custom user modal confirmation
  async function executeGrantPremium(studentId, submissionRowId = null) {
    setModal({ ...modal, isOpen: false });
    setProcessingId(submissionRowId || studentId);
    
    try {
      // Step A: Update student profile to premium
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", studentId);

      if (profileError) throw profileError;

      // Step B: Mark receipt submission status ticket as Approved if existing
      if (submissionRowId) {
        await supabase
          .from("premium_submissions")
          .update({ status: "Approved" })
          .eq("id", submissionRowId);
        
        setSubmissions((prev) => prev.filter((item) => item.id !== submissionRowId));
      }

      setAllStudents((prev) =>
        prev.map((student) =>
          student.id === studentId ? { ...student, is_premium: true } : student
        )
      );

      setModal({
        isOpen: true,
        type: "success",
        title: "Account Activated",
        message: "The student account tier upgraded successfully. All features unlocked!"
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Upgrade Failed",
        message: `Routine error encountered: ${err.message}`
      });
    } finally {
      setProcessingId(null);
    }
  }

  const filteredStudents = allStudents.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      (student.email?.toLowerCase().includes(query) || student.id.includes(query)) &&
      !student.is_premium
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="font-serif text-lg font-bold text-[#1a3312] dark:text-[#d8f0c8]">
            Premium Management Hub
          </h2>
          <p className="text-xs text-[#5a7e4e] dark:text-gray-400">
            Process incoming payment receipts and manually activate accounts.
          </p>
        </div>

        {/* ── 🖼️ SECTION 1: VISUAL PAYMENT VERIFICATION FEED ─────────── */}
        <section className="space-y-3">
          <h3 className="font-serif text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 px-1">
            <span>📥</span> Incoming Receipts ({submissions.length})
          </h3>

          {loading ? (
            <p className="text-center text-xs text-[#9ab88a] py-6 font-mono">
              Loading payment pipelines...
            </p>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-green-900/10 dark:border-emerald-900/20 bg-white dark:bg-[#112412]/30 rounded-2xl text-xs text-gray-400 dark:text-gray-500">
              No pending verification items uploaded by students right now.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {submissions.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col gap-3.5 shadow-xs"
                >
                  <div className="space-y-2.5">
                    <div className="border-b border-green-900/5 dark:border-emerald-900/20 pb-2">
                      <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium">Student Account</span>
                      <h4 className="text-xs font-black text-[#1a3312] dark:text-white truncate">{ticket.profiles?.email || "Unknown"}</h4>
                      <span className="block text-[9px] font-mono text-gray-400 dark:text-gray-500 mt-0.5 truncate">UID: {ticket.user_id}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium mb-1.5">Submitted Receipt Proof:</span>
                      <div className="bg-green-900/5 dark:bg-black/40 rounded-xl overflow-hidden border border-green-900/10 dark:border-emerald-900/20 max-h-56 flex justify-center items-center p-1">
                        <img 
                          src={ticket.computed_url} 
                          alt="Payment Receipt Asset" 
                          className="object-contain max-h-52 w-full rounded-lg transition duration-300"
                          onError={(e) => { e.target.src = "https://placehold.co/400x300?text=Error+Loading+Image+Asset"; }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerUpgradeConfirmation(ticket.user_id, ticket.id)}
                    disabled={processingId === ticket.id}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition shadow-xs active:scale-[0.99] disabled:opacity-40"
                  >
                    {processingId === ticket.id ? "Processing Unlock..." : "✅ Approve & Grant Activation"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 🔍 SECTION 2: MANUAL ACCOUNT UPGRADE LIST SEARCH ───────── */}
        <section className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/40 rounded-2xl p-4 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-xs font-bold text-[#1a3312] dark:text-gray-200">Manual Upgrade Console</h3>
            <p className="text-[10px] text-[#5a7e4e] dark:text-gray-400 mt-0.5">Force activation parameters directly on target profiles.</p>
          </div>
          
          <div className="w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student email or target profile ID..."
              className="w-full p-3 bg-green-900/5 dark:bg-[#0d1f0e] border border-green-900/10 dark:border-emerald-900/60 rounded-xl text-xs text-[#1a3312] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
            />
          </div>

          {loading ? (
            <p className="text-center text-xs text-[#9ab88a] font-mono py-2">Syncing index registries...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 py-2">
              {searchQuery ? "No matching non-premium entries found." : "Type a filter query parameter above to lookup accounts."}
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {filteredStudents.slice(0, 25).map((student) => (
                <div 
                  key={student.id} 
                  className="bg-green-900/5 dark:bg-[#162b10]/40 border border-green-900/5 dark:border-emerald-900/10 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-[#1a3312] dark:text-white truncate">
                      {student.email || "No Registered Email"}
                    </span>
                    <span className="block text-[9px] font-mono text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      ID: {student.id}
                    </span>
                  </div>

                  <button
                    onClick={() => triggerUpgradeConfirmation(student.id)}
                    disabled={processingId === student.id}
                    className="shrink-0 px-3 py-2 bg-[#5a9e48]/10 dark:bg-emerald-950 hover:bg-[#5a9e48] dark:hover:bg-emerald-900 text-[#4a6e42] dark:text-emerald-400 hover:text-white dark:hover:text-white text-[10px] font-bold rounded-xl transition border border-[#5a9e48]/20 dark:border-emerald-800/40 active:scale-95"
                  >
                    {processingId === student.id ? "..." : "Force Actv"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── CENTRAL APP REUSABLE SCREEN MODAL DIALOG CONTAINER ───────── */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/50 rounded-2xl p-5 shadow-2xl animate-in scale-in duration-150">
            <h4 className={`font-serif text-sm font-bold mb-1.5 ${
              modal.type === "error" ? "text-red-500" : modal.type === "confirm" ? "text-amber-500" : "text-[#1a3312] dark:text-emerald-400"
            }`}>
              {modal.title}
            </h4>
            <p className="text-xs text-[#4a6e42] dark:text-gray-300 leading-relaxed mb-4">
              {modal.message}
            </p>

            <div className="flex items-center justify-end gap-2">
              {modal.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setModal({ ...modal, isOpen: false })}
                    className="px-3.5 py-2 rounded-xl text-[11px] font-bold bg-green-900/5 dark:bg-white/5 text-[#4a6e42] dark:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => executeGrantPremium(modal.targetId, modal.targetSubId)}
                    className="px-3.5 py-2 rounded-xl text-[11px] font-bold bg-amber-500 text-black shadow-xs active:scale-95 transition"
                  >
                    Confirm Access
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="px-4 py-2 w-full text-center rounded-xl text-[11px] font-bold bg-[#5a9e48] dark:bg-emerald-600 text-white shadow-xs"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}