import { useLocation, useNavigate } from "react-router";
import { 
  HiHome, HiOutlineHome, 
  HiClipboardCheck, HiOutlineClipboardCheck, 
  HiChartBar, HiOutlineChartBar, 
  HiUser, HiOutlineUser 
} from "react-icons/hi";

const TABS = [
  { id: "home", label: "Home", path: "/home", IconActive: HiHome, IconOutline: HiOutlineHome },
  { id: "cbt", label: "CBT Hub", path: "/cbt", IconActive: HiClipboardCheck, IconOutline: HiOutlineClipboardCheck },
  { id: "leaderboard", label: "Ranks", path: "/leaderboard", IconActive: HiChartBar, IconOutline: HiOutlineChartBar },
  { id: "profile", label: "Profile", path: "/profile", IconActive: HiUser, IconOutline: HiOutlineUser },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPaths = ["/", "/auth", "/onboarding", "/cbt/session", "/admin"];
  const isHidden = hiddenPaths.some((p) =>
    p === "/cbt/session" ? location.pathname.startsWith("/cbt/session") : location.pathname === p
  );

  if (isHidden) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-[#0d1a0c]/90 backdrop-blur-xl border-t border-green-900/5 dark:border-[#1f3319] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl">
        {/* Removed max-w-md for desktop so it spreads, kept it centered for mobile feel */}
        <div className="flex items-center justify-around w-full max-w-6xl mx-auto h-18 px-4">
          {TABS.map((tab) => {
            const isActive = location.pathname === tab.path || (tab.path !== "/home" && location.pathname.startsWith(tab.path));
            const Icon = isActive ? tab.IconActive : tab.IconOutline;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="group relative flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 outline-none"
              >
                {/* Hover/Active Container: The "Floating Pill" */}
                <div className={`
                  absolute inset-x-2 inset-y-1 rounded-2xl transition-all duration-300 ease-out
                  ${isActive 
                    ? "bg-[#5a9e48]/10 dark:bg-[#5a9e48]/20 scale-100 opacity-100" 
                    : "bg-gray-100 dark:bg-white/5 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-95"
                  }
                `} />

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Icon className={`
                    text-2xl transition-all duration-300
                    ${isActive 
                      ? "text-[#4a8c38] dark:text-[#7ac86a] scale-110" 
                      : "text-[#9ab88a] dark:text-[#3e5e38] group-hover:text-[#5a9e48]"
                    }
                  `} />
                  
                  <span className={`
                    text-[10px] font-black tracking-widest transition-colors duration-300
                    ${isActive ? "text-[#3d7830] dark:text-[#7ac86a]" : "text-[#9ab88a] dark:text-[#3e5e38]"}
                  `}>
                    {tab.label.toUpperCase()}
                  </span>
                </div>

                {/* Subtle active glow light */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-[#5a9e48] rounded-full shadow-[0_0_8px_#5a9e48]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="h-[calc(72px+env(safe-area-inset-bottom,0px))]" />
    </>
  );
}