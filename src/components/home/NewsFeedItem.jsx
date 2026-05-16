

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// ── Helpers ──────────────────────────────────────────────────────────

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)          return "Just now";
  if (diff < 3600)        return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)   return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

// ── Component ─────────────────────────────────────────────────────────
export default function NewsFeedItem({
  id,
  title       = "",
  content     = "",
  likesCount  = 0,
  createdAt   = new Date().toISOString(),
  isNew       = false,
}) {
  const [expanded,    setExpanded]    = useState(false);
  const [liked,       setLiked]       = useState(false);
  const [localLikes,  setLocalLikes]  = useState(likesCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const isLong = content.length > 120;
  const displayContent = expanded || !isLong ? content : `${content.slice(0, 120)}…`;

  async function handleLike() {
    if (liked || likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    setLiked(true);
    setLocalLikes((n) => n + 1);

    try {
      await supabase.rpc("increment_likes", { notification_id: id });
    } catch (err) {
      // Rollback on failure
      console.error("Like failed:", err);
      setLiked(false);
      setLocalLikes((n) => n - 1);
    } finally {
      setLikeLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .nfi-root {
          background: #fff;
          border: 1px solid rgba(90,158,72,0.12);
          border-radius: 18px;
          padding: 14px 15px;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nfi-root:hover {
          box-shadow: 0 4px 20px rgba(40,100,20,0.09);
          transform: translateY(-1px);
        }
        @media (prefers-color-scheme: dark) {
          .nfi-root {
            background: #111e0f;
            border-color: rgba(90,158,72,0.15);
          }
        }

        /* Left accent stripe */
        .nfi-stripe {
          position: absolute;
          left: 0; top: 14px; bottom: 14px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(to bottom, #7ac86a, #3d7830);
        }

        .nfi-inner { padding-left: 12px; }

        /* Top row */
        .nfi-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }
        .nfi-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          color: #1a3312;
          line-height: 1.35;
          flex: 1;
        }
        @media (prefers-color-scheme: dark) {
          .nfi-title { color: #d8f0c8; }
        }

        /* NEW badge */
        .nfi-new-badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #5a9e48, #3d7830);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .06em;
          padding: 2px 7px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .nfi-new-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.8);
          animation: nfi-pulse 1.5s ease-in-out infinite;
        }
        @keyframes nfi-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }

        /* Content */
        .nfi-content {
          font-size: 12.5px;
          color: #4a6e42;
          line-height: 1.6;
          margin-bottom: 10px;
        }
        @media (prefers-color-scheme: dark) {
          .nfi-content { color: #6a9e5e; }
        }

        .nfi-read-more {
          background: none;
          border: none;
          color: #3d7830;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        @media (prefers-color-scheme: dark) {
          .nfi-read-more { color: #7ac86a; }
        }

        /* Bottom row */
        .nfi-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nfi-meta {
          font-size: 11px;
          color: #9ab88a;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .nfi-meta-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #c8e0b0;
        }

        /* Like button */
        .nfi-like {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: 1px solid rgba(90,158,72,0.2);
          border-radius: 20px;
          padding: 4px 10px 4px 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .nfi-like:hover:not(:disabled) {
          background: rgba(90,158,72,0.08);
          border-color: rgba(90,158,72,0.4);
        }
        .nfi-like.liked {
          background: rgba(90,158,72,0.12);
          border-color: #5a9e48;
        }
        .nfi-like:disabled { cursor: default; }
        .nfi-like-count {
          font-size: 11px;
          font-weight: 600;
          color: #5a7e4e;
        }
        .nfi-like.liked .nfi-like-count { color: #3d7830; }
        @media (prefers-color-scheme: dark) {
          .nfi-like { border-color: rgba(90,158,72,0.2); }
          .nfi-like.liked { background: rgba(90,158,72,0.2); }
          .nfi-like-count { color: #7ac86a; }
        }

        /* Heart icon animation */
        @keyframes nfi-heart-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.4); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .nfi-like.liked svg { animation: nfi-heart-pop 0.35s ease forwards; }
      `}</style>

      <div className="nfi-root">
        <div className="nfi-stripe" />
        <div className="nfi-inner">

          {/* Title row */}
          <div className="nfi-top">
            <p className="nfi-title">{title}</p>
            {isNew && (
              <span className="nfi-new-badge">
                <span className="nfi-new-dot" />
                New
              </span>
            )}
          </div>

          {/* Content */}
          <p className="nfi-content">
            {displayContent}
            {isLong && (
              <button className="nfi-read-more" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>

          {/* Meta + Like */}
          <div className="nfi-bottom">
            <div className="nfi-meta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ab88a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <span>{timeAgo(createdAt)}</span>
              <div className="nfi-meta-dot" />
              <span>Gradia</span>
            </div>

            <button
              className={`nfi-like ${liked ? "liked" : ""}`}
              onClick={handleLike}
              disabled={liked || likeLoading}
              aria-label={`Like this post. ${localLikes} likes.`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24"
                fill={liked ? "#5a9e48" : "none"}
                stroke={liked ? "#5a9e48" : "#7ab56a"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <span className="nfi-like-count">{localLikes}</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}