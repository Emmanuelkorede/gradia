import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { SchoolContext } from "../context/SchoolContext";
import { supabase } from "../lib/supabaseClient";
import GradiaLogo from "../components/ui/logo";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import BottomNav from "../components/ui/BottomNav";


const SCHOOLS = [
  { id: "UI",     name: "University of Ibadan",         color: "#3b82f6", bg: "#dbeafe", emoji: "🔵" },
  { id: "UNILAG", name: "University of Lagos",           color: "#ef4444", bg: "#fee2e2", emoji: "🔴" },
  { id: "OAU",    name: "Obafemi Awolowo University",   color: "#16a34a", bg: "#dcfce7", emoji: "🟢" },
];

function useColorScheme() {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  function toggle() {
    // In a real app you'd set a class on <html> and persist to localStorage.
    // Here we just track local state as a demo.
    setDark((d) => !d);
    document.documentElement.classList.toggle("dark");
  }
  return { dark, toggle };
}

export default function ProfilePage() {
  const { user, profile, isPremium, logout, refreshProfile } = useAuth();
  const { selectedSchool, setSelectedSchool } = useContext(SchoolContext);
  const navigate = useNavigate();

  const { dark, toggle: toggleDark } = useColorScheme();

  const [notifEnabled,   setNotifEnabled]   = useState(true);
  const [editNameOpen,   setEditNameOpen]   = useState(false);
  const [logoutOpen,     setLogoutOpen]     = useState(false);
  const [deleteOpen,     setDeleteOpen]     = useState(false);
  const [newName,        setNewName]        = useState(profile?.display_name ?? "");
  const [nameLoading,    setNameLoading]    = useState(false);
  const [nameError,      setNameError]      = useState(null);
  const [logoutLoading,  setLogoutLoading]  = useState(false);
  const [schoolSaving,   setSchoolSaving]   = useState(false);

  const initials = (profile?.display_name ?? user?.email ?? "?")
    .split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

  const hue = ((profile?.display_name ?? "").charCodeAt(0) * 37 + ((profile?.display_name ?? "").charCodeAt(1) ?? 0) * 13) % 360;

  // ── Save display name ────────────────────────────────────────────
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

  // ── Switch school ────────────────────────────────────────────────
  async function switchSchool(schoolId) {
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

  // ── Logout ───────────────────────────────────────────────────────
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .prof-root {
          min-height: 100dvh;
          background: #f5f9f2;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding-bottom: 100px;
        }
        @media (prefers-color-scheme: dark) { .prof-root { background: #0b160a; } }

        /* ── Hero card ───────────────────────────────────────────── */
        .prof-hero {
          background: linear-gradient(160deg, #0d2c08 0%, #1a4a10 55%, #0e3208 100%);
          padding: 56px 20px 28px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; position: relative; overflow: hidden;
        }
        .hero-orb { position: absolute; border-radius: 50%; pointer-events: none; }
        .hero-orb-1 { top:-60px; left:-60px; width:200px; height:200px; background:radial-gradient(circle,rgba(90,200,72,.18),transparent 70%); }
        .hero-orb-2 { bottom:-40px; right:-40px; width:160px; height:160px; background:radial-gradient(circle,rgba(61,120,48,.22),transparent 70%); }

        .prof-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 700; color: #fff;
          border: 3px solid rgba(255,255,255,0.2);
          margin-bottom: 12px; position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .prof-avatar-edit {
          position: absolute; bottom: 0; right: 0;
          width: 22px; height: 22px; border-radius: 50%;
          background: #5a9e48; border: 2px solid #0d2c08;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .prof-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px; font-weight: 900; color: #fff;
          margin-bottom: 5px; line-height: 1.1;
        }
        .prof-email { font-size: 11.5px; color: rgba(255,255,255,0.45); margin-bottom: 12px; }
        .prof-badges { display: flex; align-items: center; justify-content: center; gap: 7px; flex-wrap: wrap; }
        .p-badge {
          display: inline-flex; align-items: center; gap: 4px;
          border-radius: 20px; padding: 4px 11px;
          font-size: 10.5px; font-weight: 700;
          border: 1px solid rgba(255,255,255,.18);
        }
        .p-badge-premium { background: rgba(251,191,36,0.2); color: #fbbf24; }
        .p-badge-free    { background: rgba(255,255,255,0.1); color: rgba(255,255,255,.6); }
        .p-badge-school  { color: rgba(255,255,255,0.75); }

        /* ── Body ────────────────────────────────────────────────── */
        .prof-body { padding: 18px 16px; display: flex; flex-direction: column; gap: 18px; }

        /* Section */
        .pf-section {
          background: #fff;
          border: 1px solid rgba(90,158,72,0.1);
          border-radius: 20px; overflow: hidden;
        }
        @media (prefers-color-scheme: dark) {
          .pf-section { background: #111e0f; border-color: rgba(90,158,72,.12); }
        }
        .pf-section-title {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .09em;
          color: #6a9e5e; padding: 13px 16px 8px;
          border-bottom: 1px solid rgba(90,158,72,.08);
        }
        @media (prefers-color-scheme: dark) { .pf-section-title { border-bottom-color: rgba(90,158,72,.1); } }

        /* Row */
        .pf-row {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 16px;
          border-bottom: 1px solid rgba(90,158,72,.06);
          cursor: default;
          transition: background 0.15s;
        }
        .pf-row:last-child { border-bottom: none; }
        .pf-row.clickable { cursor: pointer; }
        .pf-row.clickable:hover { background: rgba(90,158,72,.04); }
        .pf-row.clickable:active { background: rgba(90,158,72,.08); }
        @media (prefers-color-scheme: dark) {
          .pf-row.clickable:hover { background: rgba(90,158,72,.08); }
        }
        .pf-row-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 17px;
        }
        .pf-row-icon.green  { background: rgba(90,158,72,.12); }
        .pf-row-icon.blue   { background: rgba(59,130,246,.12); }
        .pf-row-icon.amber  { background: rgba(251,191,36,.12); }
        .pf-row-icon.red    { background: rgba(239,68,68,.12);  }
        .pf-row-icon.purple { background: rgba(168,85,247,.12); }
        .pf-row-icon.gray   { background: rgba(107,114,128,.1); }

        .pf-row-content { flex: 1; min-width: 0; }
        .pf-row-label {
          font-size: 13.5px; font-weight: 600; color: #1a3312;
          line-height: 1.2; margin-bottom: 1px;
        }
        @media (prefers-color-scheme: dark) { .pf-row-label { color: #d8f0c8; } }
        .pf-row-sub { font-size: 11px; color: #9ab88a; font-weight: 500; }
        .pf-row-label.danger { color: #dc2626; }
        @media (prefers-color-scheme: dark) { .pf-row-label.danger { color: #f87171; } }

        /* Chevron */
        .pf-chevron { color: #c8e0b0; flex-shrink: 0; }
        @media (prefers-color-scheme: dark) { .pf-chevron { color: #2a4e22; } }

        /* Toggle switch */
        .toggle-wrap { display: flex; align-items: center; gap: 0; cursor: pointer; }
        .toggle-track {
          width: 44px; height: 24px; border-radius: 12px;
          position: relative; transition: background 0.25s;
          flex-shrink: 0;
        }
        .toggle-track.on  { background: #5a9e48; }
        .toggle-track.off { background: #d1d5db; }
        @media (prefers-color-scheme: dark) { .toggle-track.off { background: #374151; } }
        .toggle-thumb {
          position: absolute; top: 2px;
          width: 20px; height: 20px; border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,.25);
          transition: transform 0.25s cubic-bezier(.22,1,.36,1);
        }
        .toggle-track.on  .toggle-thumb { transform: translateX(20px); }
        .toggle-track.off .toggle-thumb { transform: translateX(2px); }

        /* School option */
        .school-option {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(90,158,72,.06);
          cursor: pointer; transition: background 0.15s;
        }
        .school-option:last-child { border-bottom: none; }
        .school-option:hover { background: rgba(90,158,72,.04); }
        .school-option:active { background: rgba(90,158,72,.08); }
        .school-option.active-school { background: rgba(90,158,72,.05); }
        @media (prefers-color-scheme: dark) {
          .school-option:hover { background: rgba(90,158,72,.08); }
          .school-option.active-school { background: rgba(90,158,72,.1); }
        }
        .school-emoji { font-size: 20px; flex-shrink: 0; width: 36px; text-align: center; }
        .school-info { flex: 1; }
        .school-name-main { font-size: 13px; font-weight: 700; color: #1a3312; margin-bottom: 1px; }
        @media (prefers-color-scheme: dark) { .school-name-main { color: #d8f0c8; } }
        .school-id-tag {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 9.5px; font-weight: 700;
          padding: 1px 7px; border-radius: 20px;
        }
        .school-radio {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #c8e0b0; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .school-radio.selected { border-color: #5a9e48; background: #5a9e48; }
        .school-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }

        /* Version footer */
        .prof-version {
          text-align: center;
          font-size: 11px; color: #b8d4a8; padding: 8px 0;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }

        /* Edit name input */
        .name-input {
          width: 100%;
          background: #f0f8eb;
          border: 1.5px solid #c8e0b8;
          border-radius: 14px; padding: 13px 16px;
          font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a3312; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .name-input:focus {
          border-color: #5a9e48;
          box-shadow: 0 0 0 3px rgba(90,158,72,.15);
        }
        @media (prefers-color-scheme: dark) {
          .name-input { background: #1a2e17; border-color: #243d1e; color: #e8f5e4; }
        }
      `}</style>

      <div className="prof-root">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="prof-hero">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />

          {/* Avatar */}
          <div
            className="prof-avatar"
            style={{ background: `hsl(${hue}, 50%, 38%)` }}
          >
            {initials}
            <div
              className="prof-avatar-edit"
              onClick={() => { setNewName(profile?.display_name ?? ""); setEditNameOpen(true); }}
              title="Edit name"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
          </div>

          <h1 className="prof-name">{profile?.display_name ?? "Student"}</h1>
          <p className="prof-email">{user?.email}</p>

          <div className="prof-badges">
            {isPremium ? (
              <span className="p-badge p-badge-premium">✨ Premium Member</span>
            ) : (
              <span className="p-badge p-badge-free">Free Plan</span>
            )}
            <span className="p-badge p-badge-school">
              {selectedSchool} Aspirant
            </span>
          </div>
        </div>

        <div className="prof-body">

          {/* ── Upgrade card (free users only) ─────────────────── */}
          {!isPremium && (
            <div style={{
              background: "linear-gradient(135deg,#3d7830,#5a9e48)",
              borderRadius: 20, padding: "16px 18px",
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 6px 24px rgba(58,120,40,0.3)",
            }}>
              <span style={{ fontSize: 28 }}>🔐</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 2 }}>
                  Unlock Gradia Premium
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>
                  Study mode, leaderboard & explanations
                </p>
              </div>
              <button style={{
                background: "#fff", color: "#3d7830", border: "none",
                borderRadius: 12, padding: "9px 14px",
                fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer",
                flexShrink: 0, whiteSpace: "nowrap",
              }}>
                ₦2,500
              </button>
            </div>
          )}

          {/* ── Target School ───────────────────────────────────── */}
          <div className="pf-section">
            <p className="pf-section-title">Target School</p>
            {SCHOOLS.map((s) => {
              const isActive = selectedSchool === s.id;
              return (
                <div
                  key={s.id}
                  className={`school-option ${isActive ? "active-school" : ""}`}
                  onClick={() => switchSchool(s.id)}
                  role="radio"
                  aria-checked={isActive}
                >
                  <span className="school-emoji">{s.emoji}</span>
                  <div className="school-info">
                    <p className="school-name-main">{s.name}</p>
                    <span
                      className="school-id-tag"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.id}
                    </span>
                  </div>
                  {schoolSaving && isActive ? (
                    <svg style={{ animation: "gradia-spin .7s linear infinite", color: "#5a9e48" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <style>{"@keyframes gradia-spin{to{transform:rotate(360deg)}}"}</style>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity=".3"/>
                      <path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <div className={`school-radio ${isActive ? "selected" : ""}`}>
                      {isActive && <div className="school-radio-dot" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Preferences ─────────────────────────────────────── */}
          <div className="pf-section">
            <p className="pf-section-title">Preferences</p>

            {/* Dark mode */}
            <div className="pf-row">
              <div className="pf-row-icon gray">
                {dark ? "🌙" : "☀️"}
              </div>
              <div className="pf-row-content">
                <p className="pf-row-label">Dark Mode</p>
                <p className="pf-row-sub">{dark ? "On" : "Off"}</p>
              </div>
              <div className="toggle-wrap" onClick={toggleDark} role="switch" aria-checked={dark}>
                <div className={`toggle-track ${dark ? "on" : "off"}`}>
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="pf-row">
              <div className="pf-row-icon amber">🔔</div>
              <div className="pf-row-content">
                <p className="pf-row-label">Push Notifications</p>
                <p className="pf-row-sub">News & announcements</p>
              </div>
              <div
                className="toggle-wrap"
                onClick={() => setNotifEnabled((n) => !n)}
                role="switch"
                aria-checked={notifEnabled}
              >
                <div className={`toggle-track ${notifEnabled ? "on" : "off"}`}>
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Account ─────────────────────────────────────────── */}
          <div className="pf-section">
            <p className="pf-section-title">Account</p>

            {/* Edit name */}
            <div
              className="pf-row clickable"
              onClick={() => { setNewName(profile?.display_name ?? ""); setEditNameOpen(true); }}
            >
              <div className="pf-row-icon green">✏️</div>
              <div className="pf-row-content">
                <p className="pf-row-label">Display Name</p>
                <p className="pf-row-sub">{profile?.display_name ?? "Not set"}</p>
              </div>
              <svg className="pf-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>

            {/* Email (read-only) */}
            <div className="pf-row">
              <div className="pf-row-icon blue">✉️</div>
              <div className="pf-row-content">
                <p className="pf-row-label">Email</p>
                <p className="pf-row-sub">{user?.email}</p>
              </div>
            </div>

            {/* Member since */}
            <div className="pf-row">
              <div className="pf-row-icon purple">📅</div>
              <div className="pf-row-content">
                <p className="pf-row-label">Member Since</p>
                <p className="pf-row-sub">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" })
                    : "—"
                  }
                </p>
              </div>
            </div>

            {/* Logout */}
            <div className="pf-row clickable" onClick={() => setLogoutOpen(true)}>
              <div className="pf-row-icon gray">🚪</div>
              <div className="pf-row-content">
                <p className="pf-row-label">Log Out</p>
                <p className="pf-row-sub">Sign out of your account</p>
              </div>
              <svg className="pf-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>

            {/* Delete account */}
            <div className="pf-row clickable" onClick={() => setDeleteOpen(true)}>
              <div className="pf-row-icon red">🗑</div>
              <div className="pf-row-content">
                <p className="pf-row-label danger">Delete Account</p>
                <p className="pf-row-sub">Permanently remove your data</p>
              </div>
              <svg className="pf-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

          {/* ── About ───────────────────────────────────────────── */}
          <div className="pf-section">
            <p className="pf-section-title">About</p>
            <div className="pf-row">
              <div className="pf-row-icon green">
                <GradiaLogo size={22} />
              </div>
              <div className="pf-row-content">
                <p className="pf-row-label">Gradia</p>
                <p className="pf-row-sub">Post-UTME CBT Prep · UI · UNILAG · OAU</p>
              </div>
            </div>
          </div>

          {/* Version */}
          <div className="prof-version">
            <GradiaLogo size={28} wordmark />
            <span>v1.0.0 · Made with 💚 for Nigerian students</span>
          </div>

        </div>
      </div>

      {/* ── Edit Name Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={editNameOpen}
        onClose={() => setEditNameOpen(false)}
        title="Change Display Name"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditNameOpen(false)}>Cancel</Button>
            <Button size="md" loading={nameLoading} onClick={saveDisplayName}>Save</Button>
          </>
        }
      >
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", paddingBottom: 4 }}>
          <p style={{ fontSize: 12.5, color: "#5a7e4e", marginBottom: 12, lineHeight: 1.6 }}>
            This name is shown on the leaderboard and throughout the app.
          </p>
          <input
            className="name-input"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Your display name"
            maxLength={30}
            onKeyDown={(e) => e.key === "Enter" && saveDisplayName()}
            autoFocus
          />
          {nameError && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>⚠ {nameError}</p>
          )}
          <p style={{ fontSize: 11, color: "#9ab88a", marginTop: 6 }}>
            {newName.length} / 30 characters
          </p>
        </div>
      </Modal>

      {/* ── Logout Confirm ────────────────────────────────────────── */}
      <Modal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log Out?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setLogoutOpen(false)}>Stay</Button>
            <Button variant="secondary" size="md" loading={logoutLoading} onClick={handleLogout}>
              Log Out
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 13, color: "#5a7e4e", lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          You'll be signed out of your Gradia account. Your progress and results are saved safely.
        </p>
      </Modal>

      {/* ── Delete Account Confirm ────────────────────────────────── */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" size="md" onClick={() => setDeleteOpen(false)}>
              Delete Forever
            </Button>
          </>
        }
      >
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          <p style={{ fontSize: 13, color: "#5a7e4e", lineHeight: 1.6, marginBottom: 12 }}>
            This will permanently delete your account, all test results, and your leaderboard history. <strong style={{ color: "#dc2626" }}>This cannot be undone.</strong>
          </p>
          <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 12, padding: "10px 13px", display: "flex", gap: 9 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.5 }}>
              Contact support if you just want to reset your progress instead.
            </p>
          </div>
        </div>
      </Modal>
      <BottomNav />
    </>
  );
}