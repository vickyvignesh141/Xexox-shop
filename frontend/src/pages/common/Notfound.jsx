import { useEffect, useId, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Compass, FileQuestion, Search } from "lucide-react";
import styles from "./NotFound.module.css";

/* ---------- Tamil copy (edit text here) ---------- */
const TEXT = {
  pageTitle: "404 – பக்கம் காணவில்லை",
  bubble: "Helloo! என்ன தேடிட்டு இருக்கீங்க?",
  title: "அடடா! இந்தப் பக்கம் காணவில்லை!",
  lead: "நீங்க தேடுற பக்கம் எங்கயோ காணாம போயிடுச்சு போல!",
  hint: "கவலைப்படாதீங்க... நம்ம சரியான இடத்துக்குப் போயிடலாம்!",
  home: "முகப்புக்குச் செல்லுங்கள்",
  back: "முந்தைய பக்கத்திற்குச் செல்லுங்கள்",
};

/* ---------- Floating background pieces ---------- */
const FLOATERS = [
  { id: "compass", kind: "tile", icon: Compass, x: "8%", y: "18%", dur: "7s", delay: "0s" },
  { id: "search", kind: "tile", icon: Search, x: "88%", y: "20%", dur: "8s", delay: "-2s", minor: true },
  { id: "file", kind: "tile", icon: FileQuestion, x: "84%", y: "72%", dur: "9s", delay: "-4s", minor: true },
  { id: "chat", kind: "emoji", emoji: "💬", x: "12%", y: "72%", dur: "8s", delay: "-1s", minor: true },
  { id: "confused", kind: "emoji", emoji: "😕", x: "70%", y: "8%", dur: "7.5s", delay: "-3s" },
  { id: "ring", kind: "ring", x: "94%", y: "48%", dur: "10s", delay: "-5s", minor: true },
  { id: "plus", kind: "plus", x: "5%", y: "46%", dur: "9s", delay: "-6s", minor: true },
  { id: "dot", kind: "dot", x: "22%", y: "10%", dur: "6s", delay: "-2s", minor: true },
];

const PUPIL_REACH = 6; // max pupil travel inside the eye (SVG units)

function Robot({ svgRef, pupilsRef }) {
  const gid = useId().replace(/:/g, "");

  return (
    <svg
      ref={svgRef}
      className={styles.robot}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gid}-head`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#4D7CFF" />
          <stop offset="1" stopColor="#1B2F80" />
        </linearGradient>
      </defs>

      <line x1="60" y1="24" x2="60" y2="12" stroke="#2347C9" strokeWidth="5" strokeLinecap="round" />
      <circle className={styles.antennaTip} cx="60" cy="9" r="6" fill="#FF8A3D" />

      <rect x="5" y="52" width="14" height="30" rx="7" fill="#2347C9" />
      <rect x="101" y="52" width="14" height="30" rx="7" fill="#2347C9" />
      <rect x="13" y="22" width="94" height="90" rx="38" fill={`url(#${gid}-head)`} />

      <g className={styles.eyes}>
        <circle cx="42" cy="64" r="15" fill="#fff" />
        <circle cx="78" cy="64" r="15" fill="#fff" />
        <g ref={pupilsRef} className={styles.pupils}>
          <circle cx="42" cy="64" r="7" fill="#14213D" />
          <circle cx="78" cy="64" r="7" fill="#14213D" />
          <circle cx="44.5" cy="61.5" r="2" fill="#fff" />
          <circle cx="80.5" cy="61.5" r="2" fill="#fff" />
        </g>
      </g>

      {/* one raised brow = confused */}
      <path d="M29 41 L53 45" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M67 38 Q79 28 92 37" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      <path d="M45 95 q7.5 -8 15 0 t15 0" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <circle cx="27" cy="88" r="5" fill="#FF8A3D" opacity="0.85" />
      <circle cx="93" cy="88" r="5" fill="#FF8A3D" opacity="0.85" />
    </svg>
  );
}

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const svgRef = useRef(null);
  const pupilsRef = useRef(null);

  // Tab title while this page is shown
  useEffect(() => {
    const previous = document.title;
    document.title = TEXT.pageTitle;
    return () => {
      document.title = previous;
    };
  }, []);

  // Robot's pupils follow the pointer (skipped when reduced motion is on)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let frame = 0;
    const onMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const svg = svgRef.current;
        const pupils = pupilsRef.current;
        if (!svg || !pupils) return;

        const box = svg.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 220) * PUPIL_REACH;

        pupils.style.transform = `translate(${(dx / dist) * reach}px, ${(dy / dist) * reach}px)`;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goHome = () => navigate("/");

  // "default" key = first entry in history (page opened directly), so there is nothing to go back to
  const goBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/", { replace: true });
  };

  return (
    <main className={styles.page}>
      <div className={styles.decor} aria-hidden="true">
        {FLOATERS.map((item) => {
          const Icon = item.icon;
          return (
            <span
              key={item.id}
              className={`${styles.floater} ${item.minor ? styles.minor : ""}`}
              style={{ "--x": item.x, "--y": item.y, "--dur": item.dur, "--delay": item.delay }}
            >
              {item.kind === "tile" && (
                <span className={styles.tile}>
                  <Icon size={22} strokeWidth={2.2} />
                </span>
              )}
              {item.kind === "emoji" && <span className={styles.emoji}>{item.emoji}</span>}
              {item.kind === "ring" && <span className={styles.ring} />}
              {item.kind === "plus" && <span className={styles.plus} />}
              {item.kind === "dot" && <span className={styles.dot} />}
            </span>
          );
        })}
      </div>

      <section className={styles.content} aria-labelledby="notfound-title">
        <div className={styles.scene}>
          <p className={styles.bubble}>
            {TEXT.bubble} <span aria-hidden="true">😁</span>
          </p>

          <div className={styles.hero} aria-hidden="true">
            <span className={`${styles.digit} ${styles.digitLeft}`} data-char="4">4</span>
            <Robot svgRef={svgRef} pupilsRef={pupilsRef} />
            <span className={`${styles.digit} ${styles.digitRight}`} data-char="4">4</span>
          </div>
        </div>

        <h1 id="notfound-title" className={styles.title}>
          <span className={styles.srOnly}>404 – </span>
          {TEXT.title} <span aria-hidden="true">😅</span>
        </h1>

        <p className={styles.lead}>
          {TEXT.lead} <span aria-hidden="true">🤔</span>
        </p>
        <p className={styles.hint}>
          {TEXT.hint} <span aria-hidden="true">😎</span>
        </p>

        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={goHome} aria-label={TEXT.home}>
            <span aria-hidden="true"></span>
            {TEXT.home}
          </button>
          <button type="button" className={`${styles.btn} ${styles.secondary}`} onClick={goBack} aria-label={TEXT.back}>
            <span aria-hidden="true">↩</span>
            {TEXT.back}
          </button>
        </div>
      </section>
    </main>
  );
}