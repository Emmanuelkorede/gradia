import { useEffect } from "react";


export default function ProfileModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      
      {/* Dark Dimmed Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container Sheet */}
      <div className="relative w-full h-[78vh] sm:h-auto sm:max-w-md bg-white dark:bg-[#0b160a] rounded-t-[24px] sm:rounded-2xl border-t sm:border border-green-900/10 dark:border-white/10 shadow-2xl flex flex-col transition-all duration-300 transform translate-y-0 overflow-hidden">
        
        {/* Mobile Pull/Drag Indicator Notch Bar */}
        <div className="flex justify-center py-2.5 sm:hidden flex-shrink-0 bg-inherit">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
        </div>

        {/* Modal Header */}
        <div className="px-5 pb-3 pt-1 sm:pt-4 flex items-center justify-between border-b border-green-900/10 dark:border-white/10 flex-shrink-0 bg-inherit">
          <h3 className="font-serif text-lg font-black text-[#1a3312] dark:text-[#d8f0c8]">
            {title || "Edit Profile"}
          </h3>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-green-900/5 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-green-900/10 dark:hover:bg-white/10 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Contents */}
        <div className="p-5 overflow-y-auto flex-1 no-scrollbar space-y-4">
          {children}
        </div>

      </div>
    </div>
  );
}