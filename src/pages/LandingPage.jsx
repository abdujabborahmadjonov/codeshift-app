import { useState } from "react";
import { Icon } from "../components/Icon.jsx";
import { MIGRATION_PATHS } from "../constants.js";

export function LandingPage({ onLaunch }) {
  const [hoveredPath, setHoveredPath] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const launch = (pathId) => { setMobileOpen(false); onLaunch(pathId); };

  const stats = [
    { value: "$57B", label: "Market by 2030", sub: "Legacy modernization" },
    { value: "40%", label: "Faster migrations", sub: "vs manual rewriting" },
    { value: "6", label: "Migration paths", sub: "and growing" },
  ];

  const features = [
    { icon: "zap", title: "Instant migration", desc: "Paste code, click migrate. AI handles type annotations, imports, framework patterns, and API changes in seconds." },
    { icon: "github", title: "GitHub import", desc: "Point to any public repo or file. CodeShift fetches, analyzes, and migrates without leaving the browser." },
    { icon: "shield", title: "Validation built in", desc: "Every migration includes a confidence score, change log, and warnings for anything that needs manual review." },
    { icon: "layers", title: "Diff view", desc: "See exactly what changed line by line. Green for additions, red for removals. No surprises." },
    { icon: "code", title: "6 migration paths", desc: "JS→TS, Python 2→3, React Class→Hooks, CommonJS→ESM, Flask→FastAPI, Java 8→17. More coming." },
    { icon: "clock", title: "10x faster", desc: "What used to take a team weeks now takes minutes. Focus on building features, not rewriting legacy code." },
  ];

  const pricing = [
    { name: "Free", price: "$0", period: "/month", features: ["10 migrations/month", "Single file", "Web app only", "Community support"], cta: "Start free", featured: false },
    { name: "Pro", price: "$19", period: "/month", features: ["Unlimited migrations", "Full repo import", "CLI access", "GitHub integration", "Priority support"], cta: "Start free trial", featured: true },
    { name: "Enterprise", price: "Custom", period: "", features: ["COBOL & Java migrations", "On-premise deployment", "Compliance reports", "Dedicated support", "Custom integrations"], cta: "Contact us", featured: false },
  ];

  return (
    <div className="page">
      <nav className="nav" style={{ position: "relative" }}>
        <div className="nav-brand">
          <div className="logo-mark">⇄</div>
          <span className="logo-text">CodeShift</span>
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#paths" className="nav-link">Migrations</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <button className="btn btn-ghost btn-sm" onClick={() => launch()}>Open App →</button>
        </div>
        <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? "✕" : "☰"}
        </button>
        {mobileOpen && (
          <div className="nav-mobile-menu open">
            <a href="#features" className="nav-link" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#paths" className="nav-link" onClick={() => setMobileOpen(false)}>Migrations</a>
            <a href="#pricing" className="nav-link" onClick={() => setMobileOpen(false)}>Pricing</a>
            <button className="btn btn-primary" onClick={() => launch()}>Open App →</button>
          </div>
        )}
      </nav>

      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="hero-content">
          <div className="badge">
            <span className="badge-dot" />
            AI-powered code migration engine
          </div>
          <h1 className="hero-title">Migrate your codebase in minutes</h1>
          <p className="hero-subtitle">
            AI-powered code migration that handles type annotations, framework changes, and API updates. Paste code or import from GitHub.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => launch()}>Start migrating — free</button>
            <button className="btn btn-secondary" onClick={() => launch("js-ts")}>
              <Icon name="code" size={18} /> Try JS → TS demo
            </button>
          </div>

          <div className="demo-preview">
            <div className="demo-chrome">
              <span className="demo-dot demo-dot-red" />
              <span className="demo-dot demo-dot-yellow" />
              <span className="demo-dot demo-dot-green" />
              <span className="demo-label">migration preview · app.ts</span>
            </div>
            <div className="demo-body">
              <div className="demo-pane demo-pane-before">
                <div className="demo-pane-title">Before · JavaScript</div>
                {`function getUser(id) {
  return fetch(\`/api/users/\${id}\`)
    .then(res => res.json());
}

module.exports = { getUser };`.split("\n").map((l, i) => <div key={i}>{l || " "}</div>)}
              </div>
              <div className="demo-pane demo-pane-after">
                <div className="demo-pane-title">After · TypeScript</div>
                {`interface User {
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}

export { getUser };`.split("\n").map((l, i) => <div key={i}>{l || " "}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-row">
        {stats.map((s, i) => (
          <div key={i} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <section id="paths" className="section">
        <div className="section-header">
          <h2 className="section-title">Migration paths</h2>
          <p className="section-desc">Choose your migration. More paths shipping monthly.</p>
        </div>
        <div className="grid-3 grid-paths">
          {MIGRATION_PATHS.map((p) => (
            <div
              key={p.id}
              className="card path-card"
              onMouseEnter={() => setHoveredPath(p.id)}
              onMouseLeave={() => setHoveredPath(null)}
              onClick={() => launch(p.id)}
              style={{
                borderColor: hoveredPath === p.id ? `${p.color}44` : undefined,
                background: hoveredPath === p.id ? "var(--bg-surface)" : undefined,
              }}
            >
              <div className="card-icon" style={{ background: `${p.color}18`, color: p.color, fontSize: 14, fontWeight: 700 }}>
                {p.icon}
              </div>
              <div className="path-from">{p.from}</div>
              <div className="path-arrow">→</div>
              <div className="path-to" style={{ color: p.color }}>{p.to}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-header">
          <h2 className="section-title">Built for real migrations</h2>
          <p className="section-desc">Not a toy. Not a wrapper. A migration engine.</p>
        </div>
        <div className="grid-3">
          {features.map((f, i) => (
            <div key={i} className="card">
              <div className="card-icon" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
                <Icon name={f.icon} size={18} color="var(--accent)" />
              </div>
              <div className="card-title">{f.title}</div>
              <div className="card-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="section">
        <div className="section-header">
          <h2 className="section-title">Pricing</h2>
          <p className="section-desc">Start free. Scale when ready.</p>
        </div>
        <div className="grid-3">
          {pricing.map((t, i) => (
            <div key={i} className={`card pricing-card${t.featured ? " featured" : ""}`}>
              {t.featured && <div className="pricing-badge">POPULAR</div>}
              <div className="pricing-name">{t.name}</div>
              <div className="pricing-price">
                <span className="pricing-amount">{t.price}</span>
                <span className="pricing-period">{t.period}</span>
              </div>
              {t.features.map((f, j) => (
                <div key={j} className="pricing-feature">
                  <Icon name="check" size={14} color={t.featured ? "var(--accent)" : "var(--text-faint)"} />
                  {f}
                </div>
              ))}
              <button className={`btn pricing-cta${t.featured ? " btn-primary" : " btn-secondary"}`} onClick={() => launch()}>
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">© 2026 CodeShift. AI-powered code migration.</footer>
    </div>
  );
}
