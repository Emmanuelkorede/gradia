import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import GradiaLogo from "../components/ui/logo";

const SCHOOLS = [
  {
    id: "UI",
    name: "University of Ibadan",
    short: "UI",
    logo: "/ui_logo.png", // Replace with your actual path
  },
  {
    id: "UNILAG",
    name: "University of Lagos",
    short: "UNILAG",
    logo: "/unilag-logo.png", // Replace with your actual path
  },
  {
    id: "OAU",
    name: "Obafemi Awolowo University",
    short: "OAU",
    logo: "/OAU-Logo.jpg", // Replace with your actual path
  },
];

export default function OnboardingPage() {
  const { saveOnboarding } = useAuth();
  const navigate = useNavigate();

  const [displayName,    setDisplayName]    = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  const isValid = displayName.trim().length >= 2 && selectedSchool !== null;

  async function handleSubmit() {
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      await saveOnboarding(displayName.trim(), selectedSchool);
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

return (
  <div className="flex min-h-screen flex-col bg-[#f5f9f2] dark:bg-[#0d1a0c] font-sans transition-colors duration-300">
    
    <div className="relative z-10 px-6 pt-10 pb-6 flex flex-col items-center">
      <div className="mb-4">
        <GradiaLogo size={42} wordmark />
      </div>
      <h1 className="text-2xl font-black text-[#1a3312] dark:text-white font-serif">
        Let's set you up
      </h1>
      <p className="mt-1 text-xs font-medium text-[#5a7e4e] dark:text-[#6a9e5e]">
        Quick setup — takes under a minute.
      </p>
    </div>

    <div className="flex-1 px-6 pb-32 space-y-8 max-w-md mx-auto w-full">
      
      <section>
        <label className="block text-[10px] font-bold text-[#3a6230] dark:text-[#8fc878] uppercase tracking-widest mb-3 ml-1">
          What should we call you?
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          maxLength={30}
          className="w-full bg-white dark:bg-[#131f11] border-[1.5px] border-green-900/10 dark:border-[#1f3319] rounded-2xl px-5 py-4 text-[#1a3312] dark:text-[#e8f5e4] placeholder-[#4a6e42]/30 outline-none focus:border-[#5a9e48] focus:ring-4 focus:ring-[#5a9e48]/10 transition-all"
        />
        {displayName.trim().length > 0 && displayName.trim().length < 2 && (
          <p className="mt-2 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-tight">
            Minimum 2 characters required
          </p>
        )}
      </section>

      <section>
        <label className="block text-[10px] font-bold text-[#3a6230] dark:text-[#8fc878] uppercase tracking-widest mb-4 ml-1">
          Target Institution
        </label>
        <div className="grid gap-3">
          {SCHOOLS.map((school) => {
            const isSelected = selectedSchool === school.id;
            return (
              <button
                key={school.id}
                onClick={() => setSelectedSchool(school.id)}
                className={`
                  relative flex items-center gap-4 w-full rounded-2xl border-[1.5px] p-4 transition-all duration-200
                  ${isSelected
                    ? "bg-white dark:bg-[#1a2e17] border-[#5a9e48] shadow-md ring-1 ring-[#5a9e48]"
                    : "bg-white/60 dark:bg-[#131f11] border-green-900/5 dark:border-[#1f3319] hover:border-[#5a9e48]/40 hover:bg-white dark:hover:bg-[#162514]"
                  }
                `}
              >
                {/* School Logo Container */}
                <div className="h-14 w-14 shrink-0 rounded-xl bg-gray-50 dark:bg-[#0d1a0c] border border-gray-100 dark:border-[#1f3319] flex items-center justify-center overflow-hidden">
                  <img 
                    src={school.logo} 
                    alt={school.short} 
                    className="h-10 w-10 object-contain"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=Logo'; }}
                  />
                </div>

                <div className="flex-1 text-left">
                  <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-[#1a3312] dark:text-white' : 'text-[#3a6230] dark:text-[#8fc878]'}`}>
                    {school.name}
                  </p>
                  <p className="text-[10px] font-black text-[#8aae7a] dark:text-[#4a6e42] tracking-wider uppercase mt-0.5">
                    {school.short}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className={`
                  h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected ? "bg-[#5a9e48] border-[#5a9e48]" : "border-[#c8e0b8] dark:border-[#243d1e]"}
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>

    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f5f9f2] dark:from-[#0d1a0c] to-transparent pointer-events-none">
      <button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className={`
          pointer-events-auto w-full max-w-md mx-auto flex items-center justify-center rounded-2xl py-4 text-sm font-black transition-all duration-300
          ${isValid && !loading
            ? "bg-gradient-to-br from-[#5a9e48] to-[#3d7830] text-white shadow-xl shadow-green-900/20 active:scale-95"
            : "bg-white dark:bg-[#131f11] text-[#c8e0b8] dark:text-[#1f3319] border border-green-900/10 dark:border-[#1f3319] cursor-not-allowed"
          }
        `}
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span className="flex items-center gap-2 tracking-tight">
            FINISH SETUP
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )}
      </button>
    </div>

  </div>
);
}