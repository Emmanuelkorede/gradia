import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { HiChevronLeft, HiClipboardCheck, HiCloudUpload, HiCheckCircle } from "react-icons/hi";

export default function PremiumPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Bank Info Configuration Constants
  const BANK_ACCOUNT = "0000000000000"; // ⚠️ Replace with your actual bank account
  const BANK_NAME = "launched soon"; // ⚠️ Replace with your actual bank name
  const ACCOUNT_NAME = "Gradia Edus"; // ⚠️ Replace with your actual name

  // Check if the current user already has an active or pending transmission
  useEffect(() => {
    if (!user) return;
    
    async function checkPriorSubmissions() {
      try {
        const { data, error } = await supabase
          .from("premium_submissions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setExistingSubmission(data);
        }
      } catch (err) {
        console.error("Failed to parse existing tickets:", err.message);
      } finally {
        setCheckingExisting(false);
      }
    }

    checkPriorSubmissions();
  }, [user]);

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("");
    }
  }

  function handleCopyAccount() {
    navigator.clipboard.writeText(BANK_ACCOUNT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleProcessPayment(e) {
    e.preventDefault();
    if (!file) {
      setStatus("Please upload your payment screenshot first.");
      return;
    }

    setUploading(true);
    setStatus("Uploading receipt to security vault...");

    try {
      // 1. Generate unique file paths
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id ?? "anon"}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      // 2. Upload screenshot binary payload to Storage bucket
      const { error: uploadError } = await supabase.storage
        .from("payment_receipts")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setStatus("Receipt stored! Registering database verification ticket...");

      // 3. Insert metadata reference into your table structure
      const { data: newSubmission, error: dbError } = await supabase
        .from("premium_submissions")
        .insert([
          {
            user_id: user.id,
            image_path: filePath, // Stores the raw bucket path
            status: "Pending"
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setExistingSubmission(newSubmission);
      setFile(null);
      setStatus("Success! Your receipt has been logged. Admin will activate your premium status shortly.");
    } catch (err) {
      console.error("Upload process failure:", err.message);
      setStatus("Failed to log receipt. You may already have a pending ticket open.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] font-sans pb-16">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0d1a0c]/80 backdrop-blur-md border-b border-green-900/5 px-4 pt-4 pb-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full bg-green-900/5 text-green-700 dark:text-green-400 active:scale-90 transition-all"
          >
            <HiChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-md font-black text-[#1a3312] dark:text-[#d8f0c8] uppercase tracking-wider">Premium Access</h1>
            <p className="text-[9px] font-bold text-[#6a9e5e] uppercase tracking-widest">Instant Activation Platform</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* Value Proposition Display Card */}
        <section className="bg-gradient-to-br from-[#1a3312] to-[#0d1a0c] text-white rounded-3xl p-5 shadow-xl border border-green-800/20 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-green-500/10 blur-2xl" />
          <span className="text-[9px] font-black tracking-widest bg-green-500 text-white px-2 py-0.5 rounded-full uppercase">
            Lifetime Activation
          </span>
          <h2 className="text-2xl font-serif font-black mt-3 text-[#d8f0c8]">Unlock Complete CBT Power</h2>
          <p className="text-xs text-green-200/70 mt-1 leading-relaxed">
            Gain full access to dynamic exam shuffles, unrestricted question bank limits up to 100 selections, and descriptive Study Mode solutions.
          </p>
          <div className="mt-4 pt-3 border-t border-green-900/40 flex items-baseline justify-between">
            <span className="text-xs text-green-400/80 font-bold uppercase tracking-wide">One-Time Fee</span>
            <span className="text-2xl font-black text-white font-mono">₦2,000</span>
          </div>
        </section>

        {checkingExisting ? (
          <div className="text-center p-6 font-mono text-xs text-[#6a9e5e]">
            Verifying activation status...
          </div>
        ) : existingSubmission ? (
          /* State: Student has already sent an entry */
          <section className="bg-white dark:bg-[#111e0f] rounded-2xl p-6 border border-green-900/10 dark:border-[#1f3319] text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <HiCheckCircle size={28} className={existingSubmission.status === "Approved" ? "text-emerald-500" : "text-amber-500"} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a3312] dark:text-[#d8f0c8] uppercase">
                {existingSubmission.status === "Approved" ? "Premium Active!" : "Verification Pending"}
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {existingSubmission.status === "Approved" 
                  ? "Your account has been fully upgraded. Enjoy complete lifetime features!" 
                  : "Your payment receipt is logged in the processing database queue. Our system admins are reviewing it right now."}
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 border-t border-green-900/5 pt-3">
              Ticket ID: {existingSubmission.id}
            </div>
          </section>
        ) : (
          /* State: Clean Form workflow */
          <>
            {/* Bank Data Card */}
            <section className="space-y-3">
              <label className="text-[10px] font-black text-[#6a9e5e] uppercase tracking-widest ml-1">Step 1: Make Payment</label>
              <div className="bg-white dark:bg-[#111e0f] rounded-2xl p-4 border border-green-900/10 dark:border-[#1f3319] space-y-3 shadow-sm">
                
                <div className="flex justify-between items-center bg-[#f0f8eb] dark:bg-[#0d1a0c] p-3 rounded-xl border border-green-900/5">
                  <div>
                    <p className="text-[9px] font-bold text-[#6a9e5e] uppercase tracking-wider">Account Number</p>
                    <p className="text-lg font-mono font-black text-[#1a3312] dark:text-[#d8f0c8]">{BANK_ACCOUNT}</p>
                  </div>
                  <button 
                    onClick={handleCopyAccount} 
                    className={`p-2.5 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
                      copied 
                        ? "bg-green-500 text-white" 
                        : "bg-green-900/5 text-green-700 dark:text-green-400 active:scale-95"
                    }`}
                  >
                    <HiClipboardCheck size={16} />
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <p className="text-[9px] font-bold text-[#6a9e5e]/60 uppercase">Bank Name</p>
                    <p className="font-bold text-[#1a3312] dark:text-white">{BANK_NAME}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#6a9e5e]/60 uppercase">Account Name</p>
                    <p className="font-bold text-[#1a3312] dark:text-white truncate">{ACCOUNT_NAME}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Form Submission Interface */}
            <section className="space-y-3">
              <label className="text-[10px] font-black text-[#6a9e5e] uppercase tracking-widest ml-1">Step 2: Submit Verification Receipt</label>
              <form onSubmit={handleProcessPayment} className="space-y-4">
                
                <div className="border-2 border-dashed border-green-900/20 dark:border-[#1f3319] hover:border-green-500 dark:hover:border-green-400 rounded-2xl p-6 bg-white dark:bg-[#111e0f] text-center transition-all relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <HiCloudUpload size={28} className="text-green-600/60 group-hover:text-green-500 transition-colors" />
                    <p className="text-xs font-black text-[#1a3312] dark:text-[#d8f0c8] max-w-[200px] truncate">
                      {file ? file.name : "Upload Receipt Screenshot"}
                    </p>
                    <p className="text-[9px] text-[#6a9e5e] font-medium uppercase tracking-wider">
                      {file ? "Click to substitute file" : "Supports JPEG, PNG images"}
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full h-12 !rounded-2xl shadow-xl shadow-green-900/15 font-bold tracking-wide"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Spinner size={16} color="white" />
                      <span>SUBMITTING TO SYSTEM...</span>
                    </div>
                  ) : (
                    "SUBMIT FOR VERIFICATION"
                  )}
                </Button>
              </form>

              {status && (
                <div className={`p-3 rounded-xl border text-center text-[11px] font-bold tracking-tight ${
                  status.includes("Failed") 
                    ? "bg-red-500/5 border-red-500/20 text-red-500" 
                    : "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
                }`}>
                  {status}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}