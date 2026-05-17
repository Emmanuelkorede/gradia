import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // 🔒 Super Admin strict check matching your exact id
  const SUPER_ADMIN_ID = "988219a6-5458-4545-b2c7-33f7ba89d532";
  const isSuperAdmin = user?.id === SUPER_ADMIN_ID;

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/news", label: "News & Alerts", icon: "📢" },
    { path: "/admin/upload", label: "Question Upload", icon: "📚" },
  ];

  const handleNav = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f5f9f2] dark:bg-[#0b160a] text-[#1a3312] dark:text-white font-sans transition-colors duration-200">
      
      {/* ── MOBILE TOP NAVIGATION HEADER ───────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#112412] border-b border-green-900/10 dark:border-emerald-900/40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-base font-black tracking-wider text-emerald-600 dark:text-emerald-400 font-serif">
            GRADIA ADMIN
          </h1>
          <p className="text-[10px] text-[#5a7e4e] dark:text-emerald-600/80 font-mono leading-none mt-0.5">
            Role: {profile?.role || "Admin"}
          </p>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-900/5 dark:bg-emerald-900/20 text-[#1a3312] dark:text-white active:scale-95 transition-transform"
        >
          {isMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          )}
        </button>
      </header>

      {/* ── MOBILE DROPDOWN DRAWER ─────────────────────────────────────── */}
      <div 
        className={`fixed inset-x-0 top-[57px] bg-white dark:bg-[#112412] border-b border-green-900/10 dark:border-emerald-900/50 shadow-xl z-30 transition-all duration-300 ease-in-out transform origin-top ${
          isMenuOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-90 pointer-events-none"
        }`}
      >
        <nav className="p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                isActive(item.path)
                  ? "bg-[#5a9e48] dark:bg-emerald-800 text-white shadow-sm"
                  : "bg-green-900/5 dark:bg-[#162b10]/40 text-[#4a6e42] dark:text-gray-400 active:bg-green-900/10 dark:active:bg-[#162b10]"
              }`}
            >
              <span className="text-sm">{item.icon}</span> {item.label}
            </button>
          ))}

          {/* 👑 Dynamic Super Admin Premium Activation Tab */}
          {isSuperAdmin && (
            <button
              onClick={() => handleNav("/admin/premium")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 border ${
                isActive("/admin/premium")
                  ? "bg-amber-500 border-amber-600 text-black shadow-sm"
                  : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/20 text-amber-600 dark:text-amber-400 active:bg-amber-100 dark:active:bg-amber-950/40"
              }`}
            >
              <span className="text-sm">🔑</span> Premium Hub
            </button>
          )}

          {/* Bottom Actions */}
          <button
            onClick={() => handleNav("/home")}
            className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/30 transition flex items-center gap-3 mt-2 active:bg-red-100 dark:active:bg-red-950/40"
          >
            <span>⬅️</span> Exit Panel
          </button>
        </nav>
      </div>

      {/* Background Overlay Backdrop */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)} 
          className="fixed inset-0 top-[57px] bg-black/20 dark:bg-black/50 backdrop-blur-xs z-20 transition-opacity"
        />
      )}

      {/* ── MAIN WORKSPACE ────────────────────────────────────────────── */}
      <main className="p-4 max-w-md mx-auto pb-12">
        {children}
      </main>
    </div>
  );
}