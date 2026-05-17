import { useNavigate } from "react-router"; // Added router navigation
import { useAuth } from "../../hooks/useAuth";
import { HiCheckCircle, HiLockClosed, HiShieldCheck } from "react-icons/hi";

export default function ActivationCard() {
  const { isPremium } = useAuth();
  const navigate = useNavigate(); // Hook initializer

  if (isPremium) return null;

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-[#1a3312] p-5 text-white shadow-xl mx-4 my-4 border border-white/10 transition-all duration-300">
      
      {/* Subtle Background Accents */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5a9e48] opacity-20 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/5">
            <HiLockClosed className="text-[#7ac86a] text-xs" />
            <span className="text-[9px] font-black uppercase tracking-wider text-[#c8e8b0]">
              Premium
            </span>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-[#7ac86a] animate-pulse" />
        </div>

        {/* Headline */}
        <h2 className="mb-1 text-lg font-bold leading-tight font-serif">
          Unlock <span className="text-[#7ac86a]">Gradia Premium</span>
        </h2>

        {/* Feature List */}
        <ul className="mb-5 mt-3 space-y-2">
          {[
            "Unlimited timed test sessions",
            "Study mode & explanations",
            "Global & School rankings",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <HiCheckCircle className="text-[#7ac86a] text-base shrink-0" />
              <span className="text-xs font-medium text-[#e8f5e4]/90">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Pricing Area */}
        <div className="mb-5 flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">₦2,500</span>
          <span className="text-[10px] font-bold text-[#7ac86a] uppercase">Lifetime access</span>
        </div>

        {/* Main CTA */}
        <button
          onClick={() => navigate("/premium")}
          className="w-full rounded-xl bg-white py-3 text-center text-xs font-black text-[#1a3312] shadow-lg transition-all active:scale-[0.98]"
        >
          ACTIVATE NOW
        </button>

        {/* Security Trust Link */}
        <div className="mt-3 flex items-center justify-center gap-1.5 opacity-50">
          <HiShieldCheck className="text-xs text-[#7ac86a]" />
          <span className="text-[9px] font-bold tracking-widest text-[#8aae7a] uppercase">
            Secured checkout activation
          </span>
        </div>
      </div>
    </div>
  );
}