import { useRegisterSW } from "virtual:pwa-register/react";
import { IoCloudDownloadOutline } from "react-icons/io5";

export default function UpdatePrompt() {
  // Hook interception to flag pending service worker assets
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("Gradia Core Service Worker online." , r);
    },
    onRegisterError(error) {
      console.error("PWA update mapping sync error:", error);
    },
  });

  // Keep DOM clear if no background update queue is holding
  if (!needRefresh) return null;

  return (
    <div className="fixed top-1/2 left-4 right-4 -translate-y-1/2 z-[99999] max-w-md mx-auto bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/40 shadow-2xl rounded-2xl p-5 text-[#1a3312] dark:text-white transition-all duration-300 animate-in fade-in zoom-in-95">
      <div className="flex items-start gap-3">
        {/* Update Icon Graphic Monogram Wrapper */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shadow-xs">
          <IoCloudDownloadOutline size={20} className="animate-pulse" />
        </div>

        {/* Content Body Block */}
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-xs font-black text-[#1a3312] dark:text-[#d8f0c8]">
            System Update Ready
          </h4>
          <p className="text-[11px] leading-normal text-[#4a6e42] dark:text-gray-400 mt-0.5">
            A brand new version of <span className="font-semibold text-[#1a3312] dark:text-white">Gradia</span> is available with the latest exam questions, bug fixes, and performance upgrades.
          </p>
        </div>
      </div>

      {/* Control Action Buttons Tray Container */}
      <div className="mt-4 pt-3 border-t border-green-900/5 dark:border-emerald-900/10 flex items-center justify-end gap-2">
        <button
          onClick={() => setNeedRefresh(false)}
          className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:bg-green-900/5 dark:hover:bg-white/5 transition"
        >
          Dismiss
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black text-[11px] font-bold rounded-xl transition shadow-xs active:scale-95"
        >
          Update Now
        </button>
      </div>
    </div>
  );
}