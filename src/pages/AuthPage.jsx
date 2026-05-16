import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import GradiaLogo from "../components/ui/logo";

export default function AuthPage() {
  const { login, signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/home");
      } else {
        await signUp(email, password);
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
      setGLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

    return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-[#f5f9f2] dark:bg-[#0d1a0c] font-sans transition-colors duration-300">
      
      <div className="absolute top-[-120px] left-[-80px] w-[350px] h-[350px] rounded-full bg-radial from-[#c8e8b0] to-transparent opacity-60 dark:from-[#1e4a1a] pointer-events-none" />
      <div className="absolute top-[-60px] right-[-100px] w-[280px] h-[280px] rounded-full bg-radial from-[#a8d890] to-transparent opacity-40 dark:from-[#2a5c1e] pointer-events-none" />

      {/* Adjusted spacing: reduced pt-16 to pt-8 and pb-6 to pb-4 */}
      <div className="relative z-10 flex flex-col items-center pt-8 pb-4 px-4">
        <GradiaLogo size={48} wordmark />
        <p className="mt-1 text-xs font-medium text-[#5a7e4e] dark:text-[#6a9e5e]">
          Nigeria's smartest CBT prep
        </p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 mb-8">
        <div className="bg-white/85 dark:bg-[#131f11] backdrop-blur-xl border border-green-900/10 dark:border-[#1f3319] rounded-[28px] p-8 shadow-2xl shadow-green-900/10 dark:shadow-black/20">
          
          <div className="flex bg-green-900/5 dark:bg-green-900/10 p-1 rounded-xl gap-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                mode === "login" 
                  ? "bg-[#5a9e48] text-white shadow-md" 
                  : "text-[#5a7e4e] dark:text-[#7ab56a] hover:bg-green-500/10"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                mode === "signup" 
                  ? "bg-[#5a9e48] text-white shadow-md" 
                  : "text-[#5a7e4e] dark:text-[#7ab56a] hover:bg-green-500/10"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-2xl font-black text-[#1a3312] dark:text-white leading-tight font-serif">
            {mode === "login" ? "Welcome back 👋" : "Create account ✨"}
          </h1>
          <p className="text-[#5a7e4e] dark:text-[#6a9e5e] text-sm mt-1 mb-6">
            {mode === "login" ? "Pick up right where you left off." : "Join thousands prepping smarter."}
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#3a6230] dark:text-[#8fc878] uppercase tracking-widest mb-1.5 ml-1">
                Email address
              </label>
              <input
                type="email"
                className="w-full bg-[#f0f8eb] dark:bg-[#1a2e17] border-[1.5px] border-[#c8e0b8] dark:border-[#243d1e] rounded-2xl px-4 py-3 text-[#1a3312] dark:text-[#e8f5e4] placeholder-[#4a6e42]/50 outline-none focus:border-[#5a9e48] focus:ring-4 focus:ring-[#5a9e48]/10 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#3a6230] dark:text-[#8fc878] uppercase tracking-widest mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full bg-[#f0f8eb] dark:bg-[#1a2e17] border-[1.5px] border-[#c8e0b8] dark:border-[#243d1e] rounded-2xl px-4 py-3 text-[#1a3312] dark:text-[#e8f5e4] placeholder-[#4a6e42]/50 outline-none focus:border-[#5a9e48] focus:ring-4 focus:ring-[#5a9e48]/10 transition-all"
                  placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7ab56a] hover:text-[#5a9e48] transition-colors"
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              className="w-full bg-gradient-to-br from-[#5a9e48] to-[#3d7830] text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-green-800/30 hover:shadow-green-800/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none mt-2"
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? "..." : (mode === "login" ? "Log In" : "Create Account")}
            </button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[1px] bg-[#ddeecf] dark:bg-[#1f3319]" />
            <span className="text-[10px] font-bold text-[#8aae7a] dark:text-[#4a6e42] tracking-widest">OR</span>
            <div className="flex-1 h-[1px] bg-[#ddeecf] dark:bg-[#1f3319]" />
          </div>

          <button 
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1a2e17] border-[1.5px] border-[#ddeecf] dark:border-[#243d1e] rounded-2xl py-3 font-bold text-[#1a3312] dark:text-[#c8e8b8] hover:bg-[#f5fbf0] dark:hover:bg-[#1f3819] transition-all"
            onClick={handleGoogle} 
            disabled={gLoading || loading}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm font-medium text-[#4a7e3a] dark:text-[#8fc878]">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              className="ml-2 font-bold text-[#3d7830] underline hover:text-[#5a9e48] transition-colors"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-[#8aae7a] dark:text-[#4a6e42] mt-6">
          By continuing you agree to Gradia's Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}