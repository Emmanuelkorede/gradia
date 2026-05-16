import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { SchoolContext } from "../context/SchoolContext";
import { ThemeContext } from "../context/ThemeContext";
import { supabase } from "../lib/supabaseClient";
import GradiaLogo from "../components/ui/logo";
import Button from "../components/ui/Button";
import ProfileModal from "../components/ui/ProfileModal";
import BottomNav from "../components/ui/BottomNav";

const SCHOOLS = [
  { id: "UI",     name: "University of Ibadan",         color: "#3b82f6", bg: "#dbeafe", emoji: "🔵" },
  { id: "UNILAG", name: "University of Lagos",          color: "#ef4444", bg: "#fee2e2", emoji: "🔴" },
  { id: "OAU",    name: "Obafemi Awolowo University",   color: "#16a34a", bg: "#dcfce7", emoji: "🟢" },
];

const WHATSAPP_URL = "https://wa.me/2349122865246";

export default function ProfilePage() {
  const { user, profile, isPremium, logout, refreshProfile } = useAuth();
  const { selectedSchool, setSelectedSchool } = useContext(SchoolContext);
  const { isDark, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [notifEnabled,   setNotifEnabled]   = useState(true);
  const [editNameOpen,   setEditNameOpen]   = useState(false);
  const [logoutOpen,     setLogoutOpen]     = useState(false);
  const [aboutOpen,      setAboutOpen]      = useState(false);
  const [premiumGateOpen, setPremiumGateOpen] = useState(false);
  
  const [newName,        setNewName]        = useState(profile?.display_name ?? "");
  const [nameLoading,    setNameLoading]    = useState(false);
  const [nameError,      setNameError]      = useState(null);
  const [logoutLoading,  setLogoutLoading]  = useState(false);
  const [schoolSaving,   setSchoolSaving]   = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setNewName(profile.display_name);
    }
  }, [profile]);

  const initials = (profile?.display_name ?? user?.email ?? "?")
    .split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

  const hue = ((profile?.display_name ?? "").charCodeAt(0) * 37 + ((profile?.display_name ?? "").charCodeAt(1) ?? 0) * 13) % 360;

  async function saveDisplayName() {
    if (!newName.trim() || newName.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    setNameLoading(true);
    setNameError(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: newName.trim() })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      setEditNameOpen(false);
    } catch (err) {
      setNameError(err.message || "Failed to update name.");
    } finally {
      setNameLoading(false);
    }
  }

  async function switchSchool(schoolId) {
    if (!isPremium) {
      setPremiumGateOpen(true);
      return;
    }
    if (schoolId === selectedSchool) return;
    setSchoolSaving(true);
    setSelectedSchool(schoolId);
    try {
      await supabase
        .from("profiles")
        .update({ target_school: schoolId })
        .eq("id", user.id);
      await refreshProfile();
    } catch (err) {
      console.error("School switch error:", err.message);
    } finally {
      setSchoolSaving(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await logout();
      navigate("/auth", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] font-sans pb-24 transition-colors duration-200">
      
      {/* ── Hero section ───────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0d2c08] via-[#1a4a10] to-[#0e3208] padding pt-14 px-5 pb-7 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-[-60px] left-[-60px] w-[200px] h-[200px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(90,200,72,.18),transparent_70%)]" />
        <div className="absolute bottom-[-40px] right-[-40px] w-[160px] h-[160px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(61,120,48,.22),transparent_70%)]" />

        {/* Avatar */}
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[22px] font-bold text-white border-3 border-white/20 mb-3 relative shadow-xl"
          style={{ background: `hsl(${hue}, 50%, 38%)` }}
        >
          {initials}
          <div
            className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-[#5a9e48] border-2 border-[#0d2c08] flex items-center justify-center cursor-pointer"
            onClick={() => { setNewName(profile?.display_name ?? ""); setEditNameOpen(true); }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        </div>

        <h1 className="font-serif text-[22px] font-black text-white mb-1.5 leading-none">{profile?.display_name ?? "Student"}</h1>
        <p className="text-[11.5px] color text-white/45 mb-3">{user?.email}</p>

        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {isPremium ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold border border-white/18 bg-amber-500/20 text-amber-400">✨ Premium Member</span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold border border-white/18 bg-white/10 text-white/60">Free Plan</span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold border border-white/18 text-white/75">
            {selectedSchool} Aspirant
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4.5 flex flex-col gap-4.5">

        {/* ── Premium Promotion Card ─────────────────────────── */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-[#3d7830] to-[#5a9e48] rounded-[20px] p-[16px_18px] flex items-center gap-3 shadow-md">
            <span className="text-[28px]">🔐</span>
            <div className="flex-1">
              <p className="font-serif text-[15px] font-black text-white mb-0.5">Unlock Gradia Premium</p>
              <p className="text-[11px] text-white/70 leading-normal">Study mode, leaderboard & explanations</p>
            </div>
            <button className="bg-white text-[#3d7830] border-none rounded-xl p-[9px_14px] font-sans text-xs font-bold whitespace-nowrap active:scale-95 transition-transform">
              ₦2,500
            </button>
          </div>
        )}

        {/* ── Target School Section ───────────────────────────── */}
        <div className="bg-white dark:bg-[#111e0f] border border-transparent dark:border-[#1f3319] shadow-xs rounded-[20px] overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a9e5e] p-[13px_16px_8px] border-b border-green-900/5 dark:border-green-900/10">Target School</p>
          {SCHOOLS.map((s) => {
            const isActive = selectedSchool === s.id;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2.5 p-[12px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0 cursor-pointer active:bg-green-900/5 dark:active:bg-green-900/10 transition-colors ${isActive ? "bg-green-900/[0.03] dark:bg-green-900/[0.06]" : ""}`}
                onClick={() => switchSchool(s.id)}
                role="radio"
                aria-checked={isActive}
              >
                <span className="text-[20px] shrink-0 w-9 text-center">{s.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a3312] dark:text-[#d8f0c8] mb-0.5">{s.name}</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-bold" style={{ background: s.bg, color: s.color }}>
                    {s.id}
                  </span>
                </div>
                {schoolSaving && isActive ? (
                  <svg className="animate-spin h-4 w-4 text-[#5a9e48]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity=".3"/>
                    <path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? "border-[#5a9e48] bg-[#5a9e48]" : "border-[#c8e0b0]"}`}>
                    {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Preferences Section ─────────────────────────────── */}
        <div className="bg-white dark:bg-[#111e0f] border border-transparent dark:border-[#1f3319] shadow-xs rounded-[20px] overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a9e5e] p-[13px_16px_8px] border-b border-green-900/5 dark:border-green-900/10">Preferences</p>

          {/* Dark Mode Row */}
          <div className="flex items-center gap-3 p-[13px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-gray-500/10">
              {isDark ? "🌙" : "☀️"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a3312] dark:text-[#d8f0c8] leading-tight mb-0.5">Dark Mode</p>
              <p className="text-[11px] text-[#9ab88a] font-medium">{isDark ? "On" : "Off"}</p>
            </div>
            <div className="flex items-center cursor-pointer" onClick={toggleDarkMode} role="switch" aria-checked={isDark}>
              <div className={`w-11 h-6 rounded-full relative transition-colors duration-250 shrink-0 ${isDark ? "bg-[#5a9e48]" : "bg-gray-300 dark:bg-gray-700"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-250 ${isDark ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          </div>

          {/* Notifications Row */}
          <div className="flex items-center gap-3 p-[13px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-amber-500/12">🔔</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a3312] dark:text-[#d8f0c8] leading-tight mb-0.5">Push Notifications</p>
              <p className="text-[11px] text-[#9ab88a] font-medium">News & announcements</p>
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => setNotifEnabled(!notifEnabled)} role="switch" aria-checked={notifEnabled}>
              <div className={`w-11 h-6 rounded-full relative transition-colors duration-250 shrink-0 ${notifEnabled ? "bg-[#5a9e48]" : "bg-gray-300 dark:bg-gray-700"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-250 ${notifEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Account Section ─────────────────────────────────── */}
        <div className="bg-white dark:bg-[#111e0f] border border-transparent dark:border-[#1f3319] shadow-xs rounded-[20px] overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a9e5e] p-[13px_16px_8px] border-b border-green-900/5 dark:border-green-900/10">Account</p>

          <div className="flex items-center gap-3 p-[13px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0 cursor-pointer active:bg-green-900/[0.04] dark:active:bg-green-900/[0.08]" onClick={() => { setNewName(profile?.display_name ?? ""); setEditNameOpen(true); }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-green-500/12">✏️</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a3312] dark:text-[#d8f0c8] leading-tight mb-0.5">Display Name</p>
              <p className="text-[11px] text-[#9ab88a] font-medium">{profile?.display_name ?? "Not set"}</p>
            </div>
            <svg className="text-[#c8e0b0] dark:text-[#2a4e22] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div className="flex items-center gap-3 p-[13px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-blue-500/12">✉️</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a3312] dark:text-[#d8f0c8] leading-tight mb-0.5">Email</p>
              <p className="text-[11px] text-[#9ab88a] font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-[13px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-purple-500/12">📅</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a3312] dark:text-[#d8f0c8] leading-tight mb-0.5">Member Since</p>
              <p className="text-[11px] text-[#9ab88a] font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-[13px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0 cursor-pointer active:bg-green-900/[0.04] dark:active:bg-green-900/[0.08]" onClick={() => setLogoutOpen(true)}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-gray-500/10">🚪</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-red-600 dark:text-red-400 leading-tight mb-0.5">Sign Out</p>
              <p className="text-[11px] text-[#9ab88a] font-medium">Sign out of your account session</p>
            </div>
            <svg className="text-[#c8e0b0] dark:text-[#2a4e22] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>

        {/* ── About & Support Section ───────────────────────────── */}
        <div className="bg-white dark:bg-[#111e0f] border border-transparent dark:border-[#1f3319] shadow-xs rounded-[20px] overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6a9e5e] p-[13px_16px_8px] border-b border-green-900/5 dark:border-green-900/10">About & Support</p>
          
          <div className="flex items-center gap-3 p-[13px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0 cursor-pointer active:bg-green-900/[0.04] dark:active:bg-green-900/[0.08]" onClick={() => setAboutOpen(true)}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-green-500/12"><GradiaLogo size={22} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a3312] dark:text-[#d8f0c8] leading-tight mb-0.5">Gradia</p>
              <p className="text-[11px] text-[#9ab88a] font-medium">Post-UTME CBT Prep · UI · UNILAG · OAU</p>
            </div>
            <svg className="text-[#c8e0b0] dark:text-[#2a4e22] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-[13px_16px] border-b border-green-900/5 dark:border-green-900/5 last:border-b-0 cursor-pointer active:bg-green-900/[0.04] dark:active:bg-green-900/[0.08] no-underline">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-blue-500/12">💬</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a3312] dark:text-[#d8f0c8] leading-tight mb-0.5">Get in Touch</p>
              <p className="text-[11px] text-[#9ab88a] font-medium">Chat with support on WhatsApp</p>
            </div>
            <svg className="text-[#c8e0b0] dark:text-[#2a4e22] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#b8d4a8] pt-2 pb-0 flex flex-col items-center gap-1 mt-auto">
                <GradiaLogo size={28} wordmark />
                <span>v1.0.0 · Made with 💚 for Nigerian students</span>
        </div>

      </div>

      {/* Modals */}
      <ProfileModal isOpen={editNameOpen} onClose={() => setEditNameOpen(false)} title="Change Display Name">
        <div className="pb-1">
          <p className="text-[12.5px] text-[#5a7e4e] mb-3 leading-relaxed">This name is shown on the leaderboard and throughout the app.</p>
          <input
            className="w-100 bg-[#f0f8eb] dark:bg-[#1a2e17] border border-[#c8e0b8] dark:border-[#243d1e] rounded-xl p-[13px_16px] text-base text-[#1a3312] dark:text-[#e8f5e4] outline-none focus:border-[#5a9e48] transition-all"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Your display name"
            maxLength={30}
            onKeyDown={(e) => e.key === "Enter" && saveDisplayName()}
            autoFocus
          />
          {nameError && <p className="text-xs text-red-600 mt-2">⚠ {nameError}</p>}
          <p className="text-[11px] text-[#9ab88a] mt-1.5">{newName.length} / 30 characters</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setEditNameOpen(false)}>Cancel</Button>
            <Button size="md" loading={nameLoading} onClick={saveDisplayName}>Save</Button>
          </div>
        </div>
      </ProfileModal>

      <ProfileModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} title="Log Out?">
        <div>
          <p className="text-sm text-[#5a7e4e] leading-relaxed mb-5">You'll be signed out of your Gradia account. Your progress and results are saved safely.</p>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" fullWidth onClick={() => setLogoutOpen(false)}>Stay</Button>
            <Button variant="secondary" size="md" fullWidth loading={logoutLoading} onClick={handleLogout}>Log Out</Button>
          </div>
        </div>
      </ProfileModal>

      <ProfileModal isOpen={premiumGateOpen} onClose={() => setPremiumGateOpen(false)} title="Premium Feature">
        <div className="text-center py-2.5">
          <p className="text-3xl text-center mb-3">🔒</p>
          <p className="text-sm text-[#5a7e4e] leading-relaxed mb-5">Changing your target institution is restricted to premium members. Upgrade your plan to swap options across UI, UNILAG, and OAU freely.</p>
          <Button fullWidth onClick={() => setPremiumGateOpen(false)}>Got it</Button>
        </div>
      </ProfileModal>

      <ProfileModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} title="About Gradia">
        <div className="flex flex-col items-center text-center">
          <div className="my-3"><GradiaLogo size={44} /></div>
          <p className="text-sm font-semibold text-[#1a3312] mb-2">Gradia Post-UTME Practice App</p>
          <p className="text-[12.5px] text-[#5a7e4e] leading-relaxed mb-6 max-w-[320px]">Gradia is a tailored computer-based testing dashboard designed for prospective candidates seeking admissions into UI, UNILAG, and OAU. Practice with real exam time limits, view explanations, and climb the leaderboard.</p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="w-full no-underline"><Button fullWidth>💬 Contact Developer</Button></a>
        </div>
      </ProfileModal>

      <BottomNav />
    </div>
  );
}