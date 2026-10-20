import { Link } from "react-router-dom";
import "./Home.css";

const features = [
  {
    icon: "🔄",
    title: "Seamless Patient Handoffs",
    description:
      "Make shift changes smoother with structured patient information and clear communication.",
  },
  {
    icon: "🩺",
    title: "Centralized Patient Records",
    description:
      "Keep essential patient details organized so authorized healthcare staff can access them easily.",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    description:
      "Help nurses, staff and managers coordinate patient care through one unified platform.",
  },
  {
    icon: "🔔",
    title: "Clear Shift Updates",
    description:
      "Keep important care instructions, pending tasks and handoff notes visible to the team.",
  },
];

const steps = [
  {
    number: "01",
    title: "Record patient details",
    description:
      "Document essential information and the latest patient care updates.",
  },
  {
    number: "02",
    title: "Create a handoff",
    description:
      "Organize important notes and pending tasks for the incoming shift.",
  },
  {
    number: "03",
    title: "Continue care",
    description:
      "Help the next team understand what needs attention and follow-up.",
  },
];

function Home() {
  return (
    <main className="hm-home">
      <header className="hm-navbar">
        <Link to="/home" className="hm-brand" aria-label="HandoverMind home">
          <span className="hm-brand-icon">✚</span>
          <span>
            Handover<span>Mind</span>
          </span>
        </Link>

        <nav className="hm-nav-links" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/about">About</Link>
        </nav>

        <div className="hm-nav-actions">
          <Link to="/" className="hm-login-link">
            Log in
          </Link>
          <Link to="/signup" className="hm-button hm-button-small">
            Get started <span>→</span>
          </Link>
        </div>
      </header>

      <section className="hm-hero">
        <div className="hm-hero-glow hm-glow-one" />
        <div className="hm-hero-glow hm-glow-two" />

        <div className="hm-hero-content">
          <div className="hm-eyebrow">
            <span className="hm-status-dot" />
            SMARTER COMMUNICATION. BETTER CARE.
          </div>

          <h1>
            Every handoff matters.
            <br />
            <span>Every patient matters.</span>
          </h1>

          <p className="hm-hero-description">
            A smarter way for healthcare teams to share patient updates,
            coordinate shift changes and keep essential information connected.
          </p>

          <div className="hm-hero-actions">
            <Link to="/signup" className="hm-button">
              Get started <span>→</span>
            </Link>
            <a href="#how-it-works" className="hm-secondary-button">
              Explore the platform <span>↘</span>
            </a>
          </div>

          <div className="hm-trust-note">
            <span className="hm-trust-icon">✓</span>
            Built to support clearer healthcare communication
          </div>
        </div>

        <div className="hm-hero-visual" aria-label="Illustration of a healthcare handoff dashboard">
          <div className="hm-orbit hm-orbit-one" />
          <div className="hm-orbit hm-orbit-two" />

          <div className="hm-dashboard-card">
            <div className="hm-dashboard-top">
              <div>
                <span className="hm-mini-label">CARE OVERVIEW</span>
                <h3>Shift handoff</h3>
              </div>
              <span className="hm-live-pill">
                <span /> LIVE UI
              </span>
            </div>

            <div className="hm-shift-banner">
              <div className="hm-shift-symbol">✚</div>
              <div>
                <strong>Team handoff</strong>
                <p>Keep every update in sync</p>
              </div>
              <span className="hm-arrow-circle">↗</span>
            </div>

            <div className="hm-overview-grid">
              <div className="hm-overview-tile">
                <span className="hm-tile-icon hm-tile-blue">▤</span>
                <span className="hm-mini-label">PATIENT NOTES</span>
                <strong>Organized</strong>
                <div className="hm-progress">
                  <span className="hm-progress-blue" />
                </div>
              </div>

              <div className="hm-overview-tile">
                <span className="hm-tile-icon hm-tile-green">✓</span>
                <span className="hm-mini-label">SHIFT STATUS</span>
                <strong>Coordinated</strong>
                <div className="hm-progress">
                  <span className="hm-progress-green" />
                </div>
              </div>
            </div>

            <div className="hm-activity-title">
              <strong>Handoff checklist</strong>
              <span>Illustrative preview</span>
            </div>

            <div className="hm-checklist-row">
              <span className="hm-check-icon">✓</span>
              <span>Review patient updates</span>
              <span className="hm-check-label">Ready</span>
            </div>

            <div className="hm-checklist-row">
              <span className="hm-check-icon">✓</span>
              <span>Share pending tasks</span>
              <span className="hm-check-label">Ready</span>
            </div>

            <div className="hm-checklist-row">
              <span className="hm-pending-icon">◷</span>
              <span>Confirm shift notes</span>
              <span className="hm-pending-label">Review</span>
            </div>
          </div>

          <div className="hm-float-card hm-float-top">
            <span className="hm-float-icon hm-float-blue">↔</span>
            <div>
              <strong>Smooth handoffs</strong>
              <p>Information stays organized</p>
            </div>
          </div>

          <div className="hm-float-card hm-float-bottom">
            <span className="hm-float-icon hm-float-green">✓</span>
            <div>
              <strong>Team connected</strong>
              <p>Clearer shift communication</p>
            </div>
            <span className="hm-float-sparkle">✦</span>
          </div>

          <div className="hm-decor-dot hm-dot-one" />
          <div className="hm-decor-dot hm-dot-two" />
        </div>
      </section>

      <section className="hm-value-strip" aria-label="Platform benefits">
        <div>
          <span className="hm-value-icon">↔</span>
          <span>Structured handoffs</span>
        </div>
        <div>
          <span className="hm-value-icon">◎</span>
          <span>Connected care teams</span>
        </div>
        <div>
          <span className="hm-value-icon">◷</span>
          <span>Clear shift updates</span>
        </div>
        <div>
          <span className="hm-value-icon">♡</span>
          <span>Patient-focused workflows</span>
        </div>
      </section>

      <section className="hm-features hm-section" id="features">
        <div className="hm-section-heading">
          <span className="hm-section-kicker">WHY HANDOVERMIND?</span>
          <h2>
            Less confusion.
            <br />
            <span>More connected care.</span>
          </h2>
          <p>
            Bring the important parts of shift communication together in one
            simple, organized experience.
          </p>
        </div>

        <div className="hm-feature-grid">
          {features.map((feature, index) => (
            <article
              className="hm-feature-card"
              key={feature.title}
              style={{ "--card-index": index }}
            >
              <div className="hm-feature-icon">{feature.icon}</div>
              <span className="hm-feature-number">
                0{index + 1}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="hm-feature-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="hm-work-section hm-section" id="how-it-works">
        <div className="hm-work-intro">
          <span className="hm-section-kicker">A SIMPLER WORKFLOW</span>
          <h2>
            From one shift
            <br />
            <span>to the next.</span>
          </h2>
          <p>
            A clear handoff process helps the next team understand the updates,
            instructions and tasks that matter.
          </p>
          <Link to="/signup" className="hm-text-link">
            Start your journey <span>→</span>
          </Link>
        </div>

        <div className="hm-steps">
          {steps.map((step, index) => (
            <article className="hm-step" key={step.number}>
              <div className="hm-step-number">{step.number}</div>
              <div className="hm-step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hm-step-connector" aria-hidden="true" />
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="hm-cta-section">
        <div className="hm-cta-decoration hm-cta-decoration-one" />
        <div className="hm-cta-decoration hm-cta-decoration-two" />
        <div className="hm-cta-content">
          <span className="hm-cta-kicker">BETTER COMMUNICATION STARTS HERE</span>
          <h2>Make every handoff count.</h2>
          <p>
            Help your healthcare team stay organized, informed and ready for
            the next shift.
          </p>
          <Link to="/signup" className="hm-cta-button">
            Get started with HandoverMind <span>→</span>
          </Link>
        </div>
      </section>

      <footer className="hm-footer">
        <Link to="/home" className="hm-brand hm-footer-brand">
          <span className="hm-brand-icon">✚</span>
          <span>
            Handover<span>Mind</span>
          </span>
        </Link>

        <p>Thoughtful handoffs. More connected care.</p>

        <div className="hm-footer-links">
          <a href="#features">Features</a>
          <Link to="/about">About</Link>
          <Link to="/">Log in</Link>
        </div>

        <span className="hm-copyright">
          © {new Date().getFullYear()} HandoverMind
        </span>
      </footer>
    </main>
  );
}

export default Home;