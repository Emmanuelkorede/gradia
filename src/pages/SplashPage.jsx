 import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import GradiaLogo from "../components/ui/logo";


export default function SplashPage() {

  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);



  // Once auth check is done, redirect after the splash finishes

  useEffect(() => {
    if (loading) return;

    const delay = setTimeout(() => {
      if (!user) {
        navigate("/auth");
      } else if (!profile?.display_name) {
        navigate("/onboarding");
      } else {
        navigate("/home");

      }

    }, 2400); // total splash duration



    return () => clearTimeout(delay);

  }, [loading, user, profile, navigate]);



  return (

    <>

      {/* Google Fonts */}

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');



        .splash-root {

          min-height: 100dvh;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          position: relative;

          overflow: hidden;

          background: #0d1f0e;

          font-family: 'Plus Jakarta Sans', sans-serif;

        }



        /* ---- mesh background ---- */

        .splash-mesh {

          position: absolute;

          inset: 0;

          background:

            radial-gradient(ellipse 80% 60% at 20% 30%, #1e4a1a 0%, transparent 60%),

            radial-gradient(ellipse 70% 70% at 80% 70%, #2d5a20 0%, transparent 55%),

            radial-gradient(ellipse 50% 50% at 50% 50%, #162b10 0%, transparent 70%);

          animation: meshPulse 6s ease-in-out infinite alternate;

        }

        @keyframes meshPulse {

          from { opacity: 0.8; }

          to   { opacity: 1; }

        }



        /* ---- floating orbs ---- */

        .orb {

          position: absolute;

          border-radius: 50%;

          filter: blur(60px);

          opacity: 0.35;

          animation: orbFloat 8s ease-in-out infinite alternate;

        }

        .orb-1 { width: 300px; height: 300px; background: #4a8c3a; top: -80px; left: -80px; animation-delay: 0s; }

        .orb-2 { width: 200px; height: 200px; background: #7ab54e; bottom: -60px; right: -40px; animation-delay: -3s; }

        .orb-3 { width: 150px; height: 150px; background: #c8e88a; top: 40%; left: 60%; animation-delay: -1.5s; }

        @keyframes orbFloat {

          from { transform: translate(0, 0) scale(1); }

          to   { transform: translate(20px, -20px) scale(1.08); }

        }



        /* ---- grain overlay ---- */

        .splash-grain {

          position: absolute;

          inset: 0;

          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");

          opacity: 0.4;

          pointer-events: none;

        }



        /* ---- content reveal ---- */

        .splash-content {

          position: relative;

          z-index: 10;

          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 0;

        }



        .logo-wrap {

          opacity: 0;

          transform: translateY(24px) scale(0.88);

          transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);

        }

        .logo-wrap.in {

          opacity: 1;

          transform: translateY(0) scale(1);

        }



        .wordmark-wrap {

          margin-top: 18px;

          opacity: 0;

          transform: translateY(16px);

          transition: opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s;

        }

        .wordmark-wrap.in {

          opacity: 1;

          transform: translateY(0);

        }



        .tagline-wrap {

          margin-top: 8px;

          opacity: 0;

          transform: translateY(12px);

          transition: opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s;

        }

        .tagline-wrap.in {

          opacity: 1;

          transform: translateY(0);

        }



        .appname {

          font-family: 'Playfair Display', Georgia, serif;

          font-size: 2.75rem;

          font-weight: 900;

          letter-spacing: -0.02em;

          color: #ffffff;

          line-height: 1;

        }



        .tagline {

          font-family: 'Plus Jakarta Sans', sans-serif;

          font-size: 0.85rem;

          font-weight: 500;

          color: #8fc878;

          letter-spacing: 0.12em;

          text-transform: uppercase;

        }



        /* ---- loader dots ---- */

        .loader-wrap {

          position: absolute;

          bottom: 60px;

          left: 0; right: 0;

          display: flex;

          justify-content: center;

          gap: 6px;

          opacity: 0;

          transition: opacity 0.4s ease 1s;

        }

        .loader-wrap.in { opacity: 1; }

        .dot {

          width: 6px; height: 6px;

          border-radius: 50%;

          background: #5a9e48;

          animation: dotBounce 1.2s ease-in-out infinite;

        }

        .dot:nth-child(2) { animation-delay: 0.2s; }

        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotBounce {

          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }

          40% { transform: scale(1.1); opacity: 1; }

        }



        /* ---- bottom version ---- */

        .version {

          position: absolute;

          bottom: 20px;

          font-size: 0.7rem;

          color: #3a5c30;

          font-family: 'Plus Jakarta Sans', sans-serif;

          letter-spacing: 0.05em;

        }

      `}</style>



      <div className="splash-root">

        <div className="splash-mesh" />

        <div className="orb orb-1" />

        <div className="orb orb-2" />

        <div className="orb orb-3" />

        <div className="splash-grain" />



        <div className="splash-content">

          {/* Logo icon */}

          <div className={`logo-wrap ${revealed ? "in" : ""}`}>

            <GradiaLogo size={96} />

          </div>



          {/* App name */}

          <div className={`wordmark-wrap ${revealed ? "in" : ""}`}>

            <span className="appname">Gradia</span>

          </div>



          {/* Tagline */}

          <div className={`tagline-wrap ${revealed ? "in" : ""}`}>

            <span className="tagline">Your Post-UTME Edge</span>

          </div>

        </div>



        {/* Loading dots */}

        <div className={`loader-wrap ${revealed ? "in" : ""}`}>

          <div className="dot" />

          <div className="dot" />

          <div className="dot" />

        </div>



        <span className="version">v1.0.0</span>

      </div>

    </>

  );

} 