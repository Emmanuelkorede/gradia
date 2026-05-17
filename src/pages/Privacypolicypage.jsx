import { IoArrowBack } from "react-icons/io5";

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-[#f4f7f3] dark:bg-[#0b130a] text-[#1a3312] dark:text-gray-300 transition-colors duration-200">
      
      {/* ── STICKY TOP NAVIGATION ──────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#112412]/80 backdrop-blur-md border-b border-green-900/5 dark:border-emerald-900/20 px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-1.5 rounded-xl bg-green-900/5 dark:bg-white/5 text-[#4a6e42] dark:text-gray-400 active:scale-95 transition flex items-center justify-center"
            aria-label="Go back"
          >
            <IoArrowBack size={18} />
          </button>
        )}
        <div>
          <h1 className="font-serif text-sm font-bold text-[#1a3312] dark:text-[#d8f0c8]">
            Privacy Policy
          </h1>
          <p className="text-[10px] text-[#5a7e4e] dark:text-gray-500 font-mono">
            Last Updated: May 2026
          </p>
        </div>
      </header>

      {/* ── CORE COMPLIANCE BODY CONTENT ───────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-xs leading-relaxed">
        
        {/* Intro Banner */}
        <section className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/30 rounded-2xl p-4 shadow-xs">
          <p className="font-serif text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
            🛡️ Privacy Policy for Gradia EduTech
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to Gradia (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are deeply committed to protecting your personal information and your right to privacy. This Privacy Policy outlines exactly how we collect, use, process, and safeguard your data when you interact with our website, mobile application, and Computer Based Test (CBT) preparation platform.
          </p>
        </section>

        {/* 1. Data Collection */}
        <section className="space-y-2.5">
          <h2 className="font-serif text-xs font-bold text-[#1a3312] dark:text-white flex items-center gap-2">
            <span className="text-emerald-600">1.</span> Information We Collect
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We reject excessive tracking mechanisms. We strictly limit data collection parameters to variables required to process your CBT preparation metrics and verify secure payment premium requests:
          </p>
          <div className="flex flex-col gap-2 pl-2">
            <div className="bg-white dark:bg-[#112412] border border-green-900/5 dark:border-emerald-900/10 p-3 rounded-xl">
              <strong className="text-[#1a3312] dark:text-gray-200 block mb-0.5">Account Profile Data (Google OAuth):</strong>
              To streamline your registration securely, our system hooks into Google Authentication API to capture your legal name, electronic email address, and dynamic avatar profile image identifier.
            </div>
            <div className="bg-white dark:bg-[#112412] border border-green-900/5 dark:border-emerald-900/10 p-3 rounded-xl">
              <strong className="text-[#1a3312] dark:text-gray-200 block mb-0.5">Payment Verification Assets:</strong>
              When initiating standard dynamic tier upgrading requests to Gradia Premium, screenshots or document photo receipts you upload are dispatched directly to encrypted, private repositories.
            </div>
            <div className="bg-white dark:bg-[#112412] border border-green-900/5 dark:border-emerald-900/10 p-3 rounded-xl">
              <strong className="text-[#1a3312] dark:text-gray-200 block mb-0.5">Application Usage Progress metrics:</strong>
              We log processing answers, time-stamps, generated mock test scorecard breakdowns, and syllabus categories to track performance histories inside your student dashboard.
            </div>
          </div>
        </section>

        {/* 2. Processing and Scope */}
        <section className="space-y-2">
          <h2 className="font-serif text-xs font-bold text-[#1a3312] dark:text-white flex items-center gap-2">
            <span className="text-emerald-600">2.</span> How We Use Your Information
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal information is leveraged strictly to sustain infrastructure utility and maintain direct educational features:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
            <li>To build, secure, authenticate, and personalize your unique user database profile layer.</li>
            <li>To verify manually uploaded financial verification assets and grant permanent premium access tiers.</li>
            <li>To forward essential engine system patches, notification updates, or global announcements regarding regional academic frameworks (JAMB, WAEC, POST-UTME).</li>
            <li>To debug active run-time application crashes and provide technical support feedback handlers.</li>
          </ul>
        </section>

        {/* 3. Storage Architecture */}
        <section className="space-y-2">
          <h2 className="font-serif text-xs font-bold text-[#1a3312] dark:text-white flex items-center gap-2">
            <span className="text-emerald-600">3.</span> Data Storage and Security
          </h2>
          <div className="bg-white dark:bg-[#112412] border border-green-900/10 dark:border-emerald-900/30 rounded-2xl p-4 space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              <strong className="text-[#1a3312] dark:text-gray-200">Database Safeguards:</strong> Account properties and logs are compiled through secure configurations within protected Supabase infrastructure endpoints, managed with strict access controls and robust encryption.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong className="text-[#1a3312] dark:text-gray-200">Payment Buckets:</strong> Uploaded static receipt files are siloed away into highly private, isolated object cloud storage environments. Access parameters are restricted exclusively to manual inspection by authorized app administrators.
            </p>
            <p className="text-[#4e7c45] dark:text-emerald-400 font-medium">
              🔒 Zero Commercial Distribution Policy: We do not sell, exchange, rent, lease, or track user data maps to third-party ad brokers, market research agencies, or external monetization pipelines.
            </p>
          </div>
        </section>

        {/* 4. Google API Regulatory Compliance */}
        <section className="space-y-2">
          <h2 className="font-serif text-xs font-bold text-[#1a3312] dark:text-white flex items-center gap-2">
            <span className="text-emerald-600">4.</span> Google API Disclosure
          </h2>
          <p className="text-gray-600 dark:text-gray-400 bg-green-900/5 dark:bg-[#112412]/50 border border-green-900/5 dark:border-emerald-900/10 p-3 rounded-xl font-sans text-[11px]">
            Gradia&apos;s use and transfer of information received from Google APIs to any other application will strictly adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 underline font-medium">Google API Services User Data Policy</a>, including the rigid Limited Use requirements detailed therein. Google account data hooks are managed purely to facilitate streamlined authentication mechanisms.
          </p>
        </section>

        {/* 5. User Data Rights */}
        <section className="space-y-2">
          <h2 className="font-serif text-xs font-bold text-[#1a3312] dark:text-white flex items-center gap-2">
            <span className="text-emerald-600">5.</span> Your Data Rights & Deletion
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You hold uncompromised dominion over your system data records. At any junction in your timeline, you retain full liberties to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400 mb-3">
            <li>Review or request comprehensive reporting details regarding data metrics currently mapped to your account.</li>
            <li>Request the absolute, permanent deletion of your profile tier, full answer evaluation history logs, and uploaded payment assets across our infrastructure servers.</li>
          </ul>
          <div className="bg-[#112412] dark:bg-emerald-950 p-4 rounded-xl text-white border border-emerald-900/30">
            <span className="block text-[9px] font-mono uppercase text-emerald-400 tracking-wider mb-0.5">Official Privacy Desk Contact:</span>
            <p className="text-xs font-medium">
              To trigger an account purge or assert legal data claims, drop an explicit processing notice to our official desk directly via your profile portal or at:
            </p>
            <a 
              href="mailto:emmanueljob2009@gmail.com" 
              className="mt-1.5 inline-block font-mono text-xs bg-black/30 text-amber-400 px-2.5 py-1 rounded-md border border-emerald-800/50 hover:bg-black/50 transition"
            >
              emmanueljob2009@gmail.com
            </a>
          </div>
        </section>

        {/* 6. Disclaimers and Updates */}
        <section className="space-y-2 pb-12 border-t border-green-900/5 dark:border-emerald-900/20 pt-4 text-center text-[11px] text-gray-400">
          <h2 className="font-serif text-xs font-bold text-[#1a3312] dark:text-gray-300 mb-1">
            6. Policy Amendments
          </h2>
          <p>
            We reserve rights to adjust formatting conditions within this document container over time to sync with native deployment modules or regulatory statutory modifications. Updates will instantly reflect on the timestamp pinned above.
          </p>
        </section>

      </main>
    </div>
  );
}