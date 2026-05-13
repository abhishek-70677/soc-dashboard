import { useState, useEffect, useRef, useCallback } from "react";

/* ── Google Fonts injected once ─────────────────────────────────────────── */
const FontLink = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap"
      rel="stylesheet"
    />
  </>
);

/* ── Theme tokens (same as Login.jsx) ──────────────────────────────────── */
const T = {
  bg: "#050d1a",
  bgPanel: "#070f1f",
  bgCard: "#060e1e",
  border: "rgba(0,200,255,0.12)",
  accent: "#00c8ff",
  green: "#00ffb0",
  red: "#ff4d6d",
  amber: "#fbbf24",
  purple: "#a78bfa",
  orange: "#f97316",
  text: "#e0f0ff",
  textMid: "#a0c0d8",
  textDim: "#5a8aab",
  textDark: "#2a4a6a",
  mono: "'Share Tech Mono', monospace",
  ui: "'Exo 2', sans-serif",
};

/* ── Attack data for simulator ──────────────────────────────────────────── */
const ATTACKS = [
  { type: "SQL_INJECT", sev: "CRIT", msg: "SQL injection → /api/login", color: T.red },
  { type: "DDOS", sev: "CRIT", msg: "DDoS flood detected — 52k rps", color: T.red },
  { type: "BRUTE", sev: "WARN", msg: "Brute force SSH 192.168.4.12", color: T.amber },
  { type: "XSS", sev: "WARN", msg: "XSS payload in /search?q=", color: T.amber },
  { type: "SCAN", sev: "INFO", msg: "Port scan from 10.0.0.88", color: T.accent },
  { type: "MALWARE", sev: "CRIT", msg: "Trojan signature in upload", color: T.red },
  { type: "PHISH", sev: "WARN", msg: "Phishing link in email body", color: T.amber },
  { type: "CSRF", sev: "INFO", msg: "CSRF token mismatch /admin", color: T.accent },
  { type: "RANSOM", sev: "CRIT", msg: "Ransomware encrypting /data", color: T.red },
  { type: "MITM", sev: "WARN", msg: "MITM intercept on subnet", color: T.amber },
];

const NAV_ITEMS = [
  { icon: "◈", label: "OVERVIEW", badge: null },
  { icon: "⚡", label: "LIVE ALERTS", badge: 12 },
  { icon: "◎", label: "ATTACK SIM", badge: null },
  { icon: "▦", label: "NETWORK MAP", badge: null },
  { icon: "≋", label: "ANALYTICS", badge: null },
  { icon: "✦", label: "THREAT INTEL", badge: null },
  { icon: "▤", label: "REPORTS", badge: null },
  { icon: "◇", label: "USER MGMT", badge: null },
  { icon: "⚙", label: "SETTINGS", badge: null },
];

/* ── Utility ─────────────────────────────────────────────────────────────── */
function getTimeStr() {
  return new Date().toTimeString().slice(0, 8);
}
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ── Sparkline canvas ───────────────────────────────────────────────────── */
function Sparkline({ color = T.accent }) {
  const canvasRef = useRef(null);
  const dataRef = useRef(Array.from({ length: 40 }, () => rand(8, 50)));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw() {
      const ctx = canvas.getContext("2d");
      const w = canvas.offsetWidth || 220;
      const h = canvas.offsetHeight || 60;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      const step = w / (dataRef.current.length - 1);

      ctx.beginPath();
      dataRef.current.forEach((v, i) => {
        i === 0 ? ctx.moveTo(0, h - v) : ctx.lineTo(i * step, h - v);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      dataRef.current.forEach((v, i) => {
        i === 0 ? ctx.moveTo(0, h - v) : ctx.lineTo(i * step, h - v);
      });
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fillStyle = color.replace(")", ",0.07)").replace("rgb", "rgba");
      ctx.fill();
    }

    draw();
    const id = setInterval(() => {
      dataRef.current.shift();
      dataRef.current.push(rand(6, 52));
      draw();
    }, 800);
    return () => clearInterval(id);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: 60, display: "block" }}
    />
  );
}

/* ── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, color, delta, deltaUp }) {
  return (
    <div style={{
      background: T.bgPanel,
      border: `1px solid ${T.border}`,
      borderRadius: 4,
      padding: "12px 14px",
      position: "relative",
      overflow: "hidden",
      flex: 1,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: color,
      }} />
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textDim, letterSpacing: 2, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: T.ui, fontWeight: 600, fontSize: 32, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, marginTop: 5, color: deltaUp ? T.red : T.green }}>
        {delta}
      </div>
    </div>
  );
}

/* ── Alert Item ─────────────────────────────────────────────────────────── */
function AlertItem({ sev, msg, time, isNew }) {
  const dotColor = sev === "CRIT" ? T.red : sev === "WARN" ? T.amber : T.accent;
  const sevBg = sev === "CRIT" ? "rgba(255,77,109,0.13)" : sev === "WARN" ? "rgba(251,191,36,0.1)" : "rgba(0,200,255,0.08)";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "7px 8px", borderRadius: 3,
      border: `1px solid ${isNew ? "rgba(0,200,255,0.1)" : "transparent"}`,
      background: isNew ? "rgba(0,200,255,0.03)" : "transparent",
      transition: "all .3s",
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: dotColor, flexShrink: 0,
        boxShadow: sev === "CRIT" ? `0 0 6px ${dotColor}` : "none",
      }} />
      <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textMid, flex: 1 }}>{msg}</div>
      <span style={{
        fontFamily: T.mono, fontSize: 12, padding: "1px 5px", borderRadius: 2,
        background: sevBg, color: dotColor,
        border: `1px solid ${dotColor}22`, flexShrink: 0,
      }}>{sev}</span>
      <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textDark, flexShrink: 0 }}>{time}</div>
    </div>
  );
}

/* ── Bar Chart ──────────────────────────────────────────────────────────── */
const BAR_DATA = [
  { label: "SQL Inject", count: 82, color: T.red },
  { label: "DDoS", count: 65, color: T.amber },
  { label: "Brute Force", count: 54, color: T.accent },
  { label: "XSS", count: 38, color: T.purple },
  { label: "Phishing", count: 29, color: T.green },
  { label: "Ransomware", count: 18, color: T.orange },
];

function BarChart() {
  const max = Math.max(...BAR_DATA.map(d => d.count));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {BAR_DATA.map(d => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textDim, width: 80, flexShrink: 0 }}>
            {d.label}
          </div>
          <div style={{ flex: 1, background: "rgba(0,200,255,0.05)", borderRadius: 2, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${(d.count / max) * 100}%`, height: "100%", background: d.color, borderRadius: 2 }} />
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: d.color, width: 28, textAlign: "right" }}>
            {d.count}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Geo Origins ────────────────────────────────────────────────────────── */
const GEO_DATA = [
  { name: "China", count: 312, color: T.red },
  { name: "Russia", count: 198, color: T.amber },
  { name: "USA", count: 143, color: T.accent },
  { name: "Brazil", count: 87, color: T.purple },
  { name: "Germany", count: 54, color: T.green },
  { name: "Others", count: 210, color: T.textDim },
];

function GeoPanel() {
  const max = Math.max(...GEO_DATA.map(d => d.count));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
      {GEO_DATA.map(d => (
        <div key={d.name}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textDim, flex: 1 }}>{d.name}</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: d.color }}>{d.count}</div>
          </div>
          <div style={{ height: 3, background: "rgba(0,200,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
            <div style={{ width: `${(d.count / max) * 100}%`, height: "100%", background: d.color, borderRadius: 1 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Simulator Panel ─────────────────────────────────────────────────────── */
function SimPanel({ onNewAlert }) {
  const [running, setRunning] = useState(false);
  const [feed, setFeed] = useState([{ ts: "--:--:--", msg: "Simulator ready...", cls: "dim" }]);
  const intervalRef = useRef(null);

  const toggle = useCallback(() => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
      setFeed(prev => [{ ts: getTimeStr(), msg: "Simulation stopped.", cls: "dim" }, ...prev].slice(0, 8));
    } else {
      setRunning(true);
      setFeed([{ ts: getTimeStr(), msg: "[SIM] Initializing attack vectors...", cls: "normal" }]);
      intervalRef.current = setInterval(() => {
        const a = ATTACKS[Math.floor(Math.random() * ATTACKS.length)];
        const line = { ts: getTimeStr(), msg: `[${a.type}] ${a.msg}`, cls: a.sev === "CRIT" ? "alert" : "normal" };
        setFeed(prev => [line, ...prev].slice(0, 8));
        onNewAlert({ sev: a.sev, msg: a.msg, time: "LIVE" });
      }, 1200);
    }
  }, [running, onNewAlert]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10, minHeight: 120 }}>
        {feed.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 6, fontFamily: T.mono, fontSize: 11, alignItems: "flex-start" }}>
            <span style={{ color: T.textDark, flexShrink: 0 }}>{f.ts}</span>
            <span style={{ color: f.cls === "alert" ? T.red : f.cls === "dim" ? T.textDark : T.textDim }}>
              {f.msg}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={toggle}
        style={{
          width: "100%", padding: "9px 0",
          background: running ? "rgba(251,191,36,0.08)" : "rgba(255,77,109,0.08)",
          border: `1px solid ${running ? "rgba(251,191,36,0.3)" : "rgba(255,77,109,0.3)"}`,
          color: running ? T.amber : T.red,
          fontFamily: T.mono, fontSize: 12, letterSpacing: 2,
          cursor: "pointer", borderRadius: 3, transition: "all .2s",
        }}
        onMouseEnter={e => { e.target.style.opacity = "0.8"; }}
        onMouseLeave={e => { e.target.style.opacity = "1"; }}
      >
        {running ? "■ STOP SIMULATION" : "▶ LAUNCH SIMULATION"}
      </button>
    </div>
  );
}

/* ── Panel wrapper ──────────────────────────────────────────────────────── */
function Panel({ title, badge, live, children, style = {} }) {
  const [dot, setDot] = useState(true);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setDot(d => !d), 900);
    return () => clearInterval(id);
  }, [live]);

  return (
    <div style={{
      background: T.bgPanel,
      border: `1px solid ${T.border}`,
      borderRadius: 4,
      padding: "14px 14px 12px",
      ...style,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: 3 }}>{title}</div>
        {badge && (
          <div style={{
            fontFamily: T.mono, fontSize: 12, color: live && dot ? T.green : T.textDim,
            background: "rgba(0,200,255,0.05)",
            border: `1px solid ${T.border}`,
            padding: "2px 8px", borderRadius: 2,
          }}>
            {live ? (dot ? "● LIVE" : "○ LIVE") : badge}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState(0);
  const [clock, setClock] = useState(getTimeStr());
  const [sessionTime, setSessionTime] = useState(0);
  const [alerts, setAlerts] = useState([
    { sev: "CRIT", msg: "SQLi attempt on /api/users", time: "00:12", isNew: false },
    { sev: "WARN", msg: "Brute force — SSH port 22", time: "00:34", isNew: false },
    { sev: "CRIT", msg: "DDoS flood — 48k req/s", time: "01:02", isNew: false },
    { sev: "INFO", msg: "Port scan 192.168.1.44", time: "01:28", isNew: false },
    { sev: "WARN", msg: "Malware signature detected", time: "02:05", isNew: false },
  ]);
  const [totalAlerts, setTotalAlerts] = useState(247);
  const [activeThreats, setActiveThreats] = useState(18);
  const [blocked, setBlocked] = useState(1492);
  const [inSpeed, setInSpeed] = useState("2.4");
  const [outSpeed, setOutSpeed] = useState("0.8");

  /* clock */
  useEffect(() => {
    const id = setInterval(() => {
      setClock(getTimeStr());
      setSessionTime(s => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* live counter drift */
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.6) setTotalAlerts(v => v + Math.floor(rand(1, 3)));
      if (Math.random() > 0.7) setBlocked(v => v + Math.floor(rand(1, 5)));
      setInSpeed(rand(1, 4.5).toFixed(1));
      setOutSpeed(rand(0.3, 2).toFixed(1));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const sessionStr = (() => {
    const h = Math.floor(sessionTime / 3600).toString().padStart(2, "0");
    const m = Math.floor((sessionTime % 3600) / 60).toString().padStart(2, "0");
    const s = (sessionTime % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  })();

  const handleNewAlert = useCallback((a) => {
    setAlerts(prev => [{ ...a, isNew: true }, ...prev].slice(0, 6));
    setTotalAlerts(v => v + 1);
    if (a.sev === "CRIT") setActiveThreats(v => v + 1);
  }, []);

  return (
    <>
      <FontLink />
      <div style={{
        display: "flex", height: "100vh", width: "100%",
        background: T.bg, overflow: "hidden",
        fontFamily: T.mono,
      }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: 200, minWidth: 200,
          background: T.bgPanel,
          borderRight: `1px solid ${T.border}`,
          display: "flex", flexDirection: "column",
        }}>
          {/* Logo */}
          <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 1L2 5V11C2 16 6 20.5 11 22C16 20.5 20 16 20 11V5L11 1Z"
                  fill="rgba(0,200,255,0.08)" stroke={T.accent} strokeWidth="1" />
                <path d="M7 11l2.5 2.5L15 8" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <div style={{ fontFamily: T.ui, fontWeight: 600, fontSize: 12, color: T.accent, letterSpacing: 1 }}>
                  SOC SHIELD
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.textDark, letterSpacing: 2, marginTop: 1 }}>
                  SECURITY OPS
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
            {NAV_ITEMS.map((item, i) => (
              <div
                key={i}
                onClick={() => setActiveNav(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 16px", cursor: "pointer",
                  fontSize: 12, letterSpacing: 1,
                  color: activeNav === i ? T.accent : T.textDim,
                  background: activeNav === i ? "rgba(0,200,255,0.08)" : "transparent",
                  borderLeft: `2px solid ${activeNav === i ? T.accent : "transparent"}`,
                  transition: "all .15s",
                }}
                onMouseEnter={e => { if (activeNav !== i) e.currentTarget.style.color = T.accent; }}
                onMouseLeave={e => { if (activeNav !== i) e.currentTarget.style.color = T.textDim; }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: "rgba(255,77,109,0.18)", color: T.red,
                    fontSize: 8, padding: "1px 5px", borderRadius: 2,
                  }}>{item.badge}</span>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 3 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: T.green, marginRight: 5, verticalAlign: "middle" }} />
              ADMIN ONLINE
            </div>
            <div style={{ fontSize: 8, color: T.textDark }}>SESSION: {sessionStr}</div>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Topbar */}
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", height: 48,
            background: T.bgCard,
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 12, color: T.textDim, letterSpacing: 2 }}>
              ▸ SECURITY OPERATIONS CENTER — REAL-TIME MONITOR
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ fontSize: 12, letterSpacing: 1 }}>
                THREAT: <span style={{ color: T.red }}>HIGH</span>
              </div>
              <div style={{ fontSize: 12, color: T.textDark, fontVariantNumeric: "tabular-nums" }}>{clock}</div>
              <div style={{
                fontSize: 12, color: T.accent,
                background: "rgba(0,200,255,0.08)",
                border: `1px solid rgba(0,200,255,0.15)`,
                padding: "3px 10px", borderRadius: 2,
              }}>
                ADMIN ▾
              </div>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, overflowY: "auto", padding: 16 }}>

            {/* Stat cards */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <StatCard label="TOTAL ALERTS" value={totalAlerts.toLocaleString()} color={T.accent} delta="▲ +14 last hour" deltaUp />
              <StatCard label="ACTIVE THREATS" value={activeThreats} color={T.red} delta="▲ +3 critical" deltaUp />
              <StatCard label="BLOCKED ATTACKS" value={blocked.toLocaleString()} color={T.green} delta="▼ 98.8% blocked" deltaUp={false} />
              <StatCard label="SYS HEALTH" value="94%" color={T.amber} delta="● 3 nodes warning" deltaUp />
            </div>

            {/* Mid row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>

              {/* Live Alerts */}
              <Panel title="LIVE ALERTS" badge="LIVE" live>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {alerts.map((a, i) => (
                    <AlertItem key={i} {...a} />
                  ))}
                </div>
              </Panel>

              {/* Attack types */}
              <Panel title="ATTACK TYPES" badge="LAST 24H">
                <BarChart />
              </Panel>
            </div>

            {/* Bottom row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>

              {/* Traffic */}
              <Panel title="TRAFFIC MONITOR" badge="LIVE" live>
                <Sparkline color={T.accent} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent }}>
                    ▲ IN: <span style={{ fontVariantNumeric: "tabular-nums" }}>{inSpeed}</span> MB/s
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.red }}>
                    ▼ OUT: <span style={{ fontVariantNumeric: "tabular-nums" }}>{outSpeed}</span> MB/s
                  </span>
                </div>
              </Panel>

              {/* Geo origins */}
              <Panel title="TOP ATTACK ORIGINS">
                <GeoPanel />
              </Panel>

              {/* Simulator */}
              <Panel title="ATTACK SIMULATOR">
                <SimPanel onNewAlert={handleNewAlert} />
              </Panel>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}