import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Theme tokens (reuse across all pages) ─────────────────────────────── */
const T = {
  bg: "#050d1a",
  bgCard: "rgba(8, 20, 42, 0.85)",
  border: "rgba(0, 200, 255, 0.18)",
  accent: "#00c8ff",
  accentDim: "rgba(0, 200, 255, 0.12)",
  accentGlow: "rgba(0, 200, 255, 0.35)",
  danger: "#ff4d6d",
  text: "#e0f0ff",
  textMuted: "#5a8aab",
  textDim: "#2a4a6a",
  green: "#00ffb0",
  font: "'Share Tech Mono', monospace",
  fontUI: "'Exo 2', sans-serif",
};

/* ─── Animated canvas background ────────────────────────────────────────── */
function CyberCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;

    const NODES = 55;
    const CONNECT_DIST = 160;
    let nodes = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initNodes() {
      nodes = Array.from({ length: NODES }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 2 + 1.2,
        pulse: Math.random() * Math.PI * 2,
        type: Math.random() < 0.15 ? "hub" : "dot",
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* grid overlay */
      ctx.strokeStyle = "rgba(0,200,255,0.03)";
      ctx.lineWidth = 0.5;
      const step = 60;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      /* connections */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.4;
            ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      /* nodes */
      nodes.forEach((n) => {
        n.pulse += 0.02;
        const glow = 0.6 + Math.sin(n.pulse) * 0.4;

        if (n.type === "hub") {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,200,255,${glow * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,200,255,${glow * 0.55})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.type === "hub"
          ? `rgba(0,255,176,${glow})`
          : `rgba(0,200,255,${glow * 0.8})`;
        ctx.fill();

        /* update position */
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    initNodes();
    draw();
    window.addEventListener("resize", () => { resize(); initNodes(); });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, background: T.bg }}
    />
  );
}

/* ─── Scan line flicker effect ───────────────────────────────────────────── */
function ScanLine() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
      background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)",
    }} />
  );
}

/* ─── Main Login component ───────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ user: "", pass: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [showPass, setShowPass] = useState(false);

  /* blinking cursor tick */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  function submit(e) {
    e.preventDefault();
    if (!form.user || !form.pass) { setError("All fields required."); return; }
    setLoading(true);
    setTimeout(() => {
      if (form.user === "admin" && form.pass === "admin123") {
        navigate("/dashboard");
      } else {
        setError("ACCESS DENIED — Invalid credentials.");
        setLoading(false);
      }
    }, 1400);
  }

  const cursor = tick % 2 === 0 ? "|" : " ";

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap" rel="stylesheet" />

      <CyberCanvas />
      <ScanLine />

      <div style={{
        position: "fixed", inset: 0, zIndex: 2,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}>
        <div style={{
          width: "100%", maxWidth: 420,
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 4,
          backdropFilter: "blur(18px)",
          boxShadow: `0 0 60px rgba(0,200,255,0.07), 0 0 0 1px rgba(0,200,255,0.06)`,
          overflow: "hidden",
        }}>

          {/* ── Header bar ── */}
          <div style={{
            background: "rgba(0,200,255,0.06)",
            borderBottom: `1px solid ${T.border}`,
            padding: "10px 20px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
            <span style={{ fontFamily: T.font, fontSize: 11, color: T.textMuted, marginLeft: 8 }}>
              SOC-TERMINAL v2.1 — SECURE ACCESS
            </span>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "36px 36px 32px" }}>

            {/* Logo / Title */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              {/* Shield icon SVG */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
                  <path d="M27 4L6 13V27C6 38.5 15.5 49 27 52C38.5 49 48 38.5 48 27V13L27 4Z"
                    fill="rgba(0,200,255,0.08)" stroke={T.accent} strokeWidth="1.5" />
                  <path d="M19 27l5.5 5.5L36 22" stroke={T.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="27" cy="27" r="10" stroke="rgba(0,200,255,0.2)" strokeWidth="0.8" />
                </svg>
              </div>

              <div style={{ fontFamily: T.font, color: T.accent, fontSize: 11, letterSpacing: 4, marginBottom: 6 }}>
                ▸ AI-POWERED SOC DASHBOARD
              </div>
              <div style={{ fontFamily: T.fontUI, fontWeight: 600, color: T.text, fontSize: 22, letterSpacing: 1 }}>
                OPERATOR ACCESS
              </div>
              <div style={{ fontFamily: T.font, color: T.textMuted, fontSize: 11, marginTop: 4 }}>
                AUTHENTICATE TO CONTINUE{cursor}
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={submit} autoComplete="off">

              {/* Username */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: T.font, fontSize: 10, color: T.accent, letterSpacing: 2, display: "block", marginBottom: 6 }}>
                  ◈ OPERATOR ID
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    fontFamily: T.font, fontSize: 13, color: T.textMuted,
                  }}>
                    $
                  </span>
                  <input
                    name="user"
                    value={form.user}
                    onChange={handle}
                    placeholder="enter_username"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "rgba(0,200,255,0.04)",
                      border: `1px solid ${T.border}`,
                      borderRadius: 3,
                      padding: "10px 12px 10px 28px",
                      fontFamily: T.font, fontSize: 13,
                      color: T.text,
                      outline: "none",
                      transition: "border-color .2s",
                    }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontFamily: T.font, fontSize: 10, color: T.accent, letterSpacing: 2, display: "block", marginBottom: 6 }}>
                  ◈ PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    fontFamily: T.font, fontSize: 13, color: T.textMuted,
                  }}>
                    ★
                  </span>
                  <input
                    name="pass"
                    type={showPass ? "text" : "password"}
                    value={form.pass}
                    onChange={handle}
                    placeholder="••••••••••"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "rgba(0,200,255,0.04)",
                      border: `1px solid ${T.border}`,
                      borderRadius: 3,
                      padding: "10px 38px 10px 28px",
                      fontFamily: T.font, fontSize: 13,
                      color: T.text,
                      outline: "none",
                      transition: "border-color .2s",
                    }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: T.font, fontSize: 10, color: T.textMuted, padding: 0,
                    }}
                  >
                    {showPass ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  fontFamily: T.font, fontSize: 11, color: T.danger,
                  background: "rgba(255,77,109,0.08)",
                  border: `1px solid rgba(255,77,109,0.25)`,
                  borderRadius: 3, padding: "8px 12px", marginBottom: 16,
                  letterSpacing: 1,
                }}>
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? "rgba(0,200,255,0.06)" : "rgba(0,200,255,0.1)",
                  border: `1px solid ${loading ? T.textDim : T.accent}`,
                  borderRadius: 3,
                  padding: "12px",
                  fontFamily: T.font, fontSize: 13, letterSpacing: 3,
                  color: loading ? T.textMuted : T.accent,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all .2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => { if (!loading) { e.target.style.background = "rgba(0,200,255,0.18)"; e.target.style.boxShadow = `0 0 20px ${T.accentGlow}`; } }}
                onMouseLeave={e => { e.target.style.background = "rgba(0,200,255,0.1)"; e.target.style.boxShadow = "none"; }}
              >
                {loading ? "AUTHENTICATING..." : "INITIATE ACCESS ▶"}
              </button>
            </form>

            {/* Demo hint */}
            <div style={{
              marginTop: 20, textAlign: "center",
              fontFamily: T.font, fontSize: 10, color: T.textMuted, letterSpacing: 1,
            }}>
              DEMO — admin / admin123
            </div>
          </div>

          {/* ── Footer status bar ── */}
          <div style={{
            background: "rgba(0,200,255,0.03)",
            borderTop: `1px solid ${T.border}`,
            padding: "8px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontFamily: T.font, fontSize: 9, color: T.textMuted }}>
              <span style={{ color: T.green }}>●</span> SYSTEM ONLINE
            </span>
            <span style={{ fontFamily: T.font, fontSize: 9, color: T.textMuted }}>
              TLS 1.3 ENCRYPTED
            </span>
            <span style={{ fontFamily: T.font, fontSize: 9, color: T.textMuted }}>
              MCA PROJECT © 2025
            </span>
          </div>
        </div>
      </div>
    </>
  );
}