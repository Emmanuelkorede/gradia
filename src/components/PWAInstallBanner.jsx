import { useState, useEffect } from "react";
import { IoClose, IoDownloadOutline, IoShareOutline } from "react-icons/io5";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const lastDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (lastDismissed) {
      const hoursPassed = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        return; // Skip showing the banner entirely for today 🟢
      }
    }

    // 2. Detect if the device is an iPhone/iPad
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if the app is already running in standalone install mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

    if (isAppleMobile && !isStandalone) {
      setIsIOS(true);
      setIsVisible(true);
    }

    // 3. Intercept Android/Chrome automatic prompt request
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);   
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Smart handler to close banner and mute it for 24 hours
  function handleDismiss() {
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString()); // Set timestamp 🟢
    setIsVisible(false);
  }

  async function handleAndroidInstallClick() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation decision: ${outcome}`);
    
    if (outcome === "accepted") {
      setIsVisible(false);
    } else {
      // If they reject the browser popup, mute the banner for 24 hours too
      handleDismiss();
    }
    setDeferredPrompt(null);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9999] max-w-md mx-auto bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/40 shadow-xl rounded-2xl p-4 text-[#1a3312] dark:text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-green-900/5 dark:bg-[#0d1f0e] border border-green-900/5 dark:border-emerald-900/20 flex items-center justify-center text-lg shadow-xs">
          <span>🎓</span>
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-serif text-xs font-black text-[#1a3312] dark:text-[#d8f0c8]">
            Install Gradia Mobile
          </h4>
          <p className="text-[11px] leading-normal text-[#4a6e42] dark:text-gray-400 mt-0.5">
            {isIOS ? (
              <span className="flex flex-wrap items-center gap-1">
                Tap the <IoShareOutline className="inline text-emerald-600 dark:text-emerald-400 font-bold" size={14} /> icon below, then select <span className="font-semibold text-[#1a3312] dark:text-white">&quot;Add to Home Screen&quot;</span>.
              </span>
            ) : (
              "Install our offline-ready, lightning fast app straight to your device."
            )}
          </p>
        </div>

        <button
          onClick={handleDismiss} // Updated to smart dismiss 🟢
          className="shrink-0 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition rounded-lg"
          aria-label="Dismiss banner"
        >
          <IoClose size={18} />
        </button>
      </div>

      {!isIOS && (
        <div className="mt-3.5 pt-3 border-t border-green-900/5 dark:border-emerald-900/10 flex items-center justify-end gap-2">
          <button 
            onClick={handleDismiss} // Updated to smart dismiss 🟢
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:bg-green-900/5 dark:hover:bg-white/5 transition"
          >
            Not Now
          </button>
          <button
            onClick={handleAndroidInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black text-[11px] font-bold rounded-xl transition shadow-xs active:scale-95"
          >
            <IoDownloadOutline size={13} />
            Install App
          </button>
        </div>
      )}
    </div>
  );
}