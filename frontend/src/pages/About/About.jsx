import { Link } from "react-router-dom";
import "./About.css";

const principles = [
  {
    number: "01",
    icon: "💬",
    title: "Clear communication",
    description:
      "Make important shift updates easier to organize, understand and share with the next care team.",
  },
  {
    number: "02",
    icon: "🤝",
    title: "Connected teamwork",
    description:
      "Support coordination between nurses, healthcare staff and managers through a shared workflow.",
  },
  {
    number: "03",
    icon: "🛡️",
    title: "Care with clarity",
    description:
      "Help teams keep essential notes, instructions and pending tasks visible during handoffs.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Capture the essentials",
    description:
      "Bring relevant patient updates and important instructions into a structured handoff.",
  },
  {
    number: "02",
    title: "Share with the team",
    description:
      "Make shift information easier for authorized team members to review and understand.",
  },
  {
    number: "03",
    title: "Support continuity",
    description:
      "Help the incoming team identify pending tasks and understand the next steps in care.",
  },
];

function About() {
  return (
    <main className="hm-about">
      <header className="hm-about-navbar">
        <Link to="/home" className="hm-about-brand" aria-label="HandoverMind home">
          <span className="hm-about-brand-icon">✚</span>
          <span>
            Handover<span>Mind</span>
          </span>
        </Link>

        <nav className="hm-about-nav" aria-label="Main navigation">
          <Link to="/home">Home</Link>
          <a href="#our-approach">Our approach</a>
          <a href="#our-vision">Our vision</a>
        </nav>

        <div className="hm-about-actions">
          <Link to="/" className="hm-about-login">
            Log in
          </Link>
          <Link to="/signup" className="hm-about-button hm-about-button-small">
            Get started <span>→</span>
          </Link>
        </div>
      </header>

      <section className="hm-about-hero">
        <div className="hm-about-hero-decoration hm-about-decoration-one" />
        <div className="hm-about-hero-decoration hm-about-decoration-two" />

        <div className="hm-about-hero-copy">
          <div className="hm-about-eyebrow">
            <span className="hm-about-eyebrow-dot" />
            GET TO KNOW HANDOVERMIND
          </div>

          <h1>
            Better handoffs.
            <br />
            <span>Stronger connections.</span>
          </h1>

          <p>
            We believe clear communication can make healthcare teamwork
            smoother. HandoverMind is designed to help care teams organize
            shift updates and keep important information connected.
          </p>

          <div className="hm-about-hero-actions">
            <Link to="/home" className="hm-about-button">
              Explore homepage <span>→</span>
            </Link>
            <a href="#our-mission" className="hm-about-outline-button">
              Discover our mission <span>↓</span>
            </a>
          </div>
        </div>

        <div className="hm-about-hero-art" aria-label="Illustration of connected healthcare team members">
          <div className="hm-about-art-orbit hm-about-art-orbit-one" />
          <div className="hm-about-art-orbit hm-about-art-orbit-two" />

          <div className="hm-about-art-center">
            <div className="hm-about-art-cross">✚</div>
            <strong>Care connects us.</strong>
            <span>Communication moves us forward.</span>
          </div>

          <div className="hm-about-team-card hm-about-team-top">
            <span className="hm-about-avatar hm-about-avatar-blue">✚</span>
            <div>
              <strong>Patient updates</strong>
              <p>Information organized</p>
            </div>
            <span className="hm-about-team-check">✓</span>
          </div>

          <div className="hm-about-team-card hm-about-team-left">
            <span className="hm-about-avatar hm-about-avatar-green">♡</span>
            <div>
              <strong>Patient-focused</strong>
              <p>Care comes first</p>
            </div>
          </div>

          <div className="hm-about-team-card hm-about-team-right">
            <span className="hm-about-avatar hm-about-avatar-purple">↔</span>
            <div>
              <strong>Team handoff</strong>
              <p>Clearer coordination</p>
            </div>
          </div>

          <span className="hm-about-art-dot hm-about-art-dot-one" />
          <span className="hm-about-art-dot hm-about-art-dot-two" />
          <span className="hm-about-art-dot hm-about-art-dot-three" />
        </div>
      </section>

      <section className="hm-about-mission hm-about-section" id="our-mission">
        <div className="hm-about-mission-visual">
          <div className="hm-about-mission-glow" />

          <div className="hm-about-mission-card">
            <span className="hm-about-mission-icon">♡</span>
            <span className="hm-about-small-label">OUR PURPOSE</span>
            <h3>Make every update count.</h3>
            <p>
              Because essential information deserves a clear place in every
              shift transition.
            </p>

            <div className="hm-about-mission-divider" />

            <div className="hm-about-mission-point">
              <span>✓</span>
              Structured information
            </div>
            <div className="hm-about-mission-point">
              <span>✓</span>
              Better team coordination
            </div>
            <div className="hm-about-mission-point">
              <span>✓</span>
              Clearer next steps
            </div>
          </div>

          <div className="hm-about-mission-floating">
            <span>✦</span>
            Thoughtful by design
          </div>
        </div>

        <div className="hm-about-mission-copy">
          <span className="hm-about-section-kicker">OUR MISSION</span>
          <h2>
            Make healthcare
            <br />
            communication
            <br />
            <span>feel simpler.</span>
          </h2>

          <p>
            A shift change is more than a change of people. It is a moment when
            information, instructions and responsibilities need to move from
            one team to another.
          </p>

          <p>
            HandoverMind aims to make that process more structured and
            understandable, helping healthcare teams focus on communication
            instead of searching for scattered updates.
          </p>

          <a href="#our-approach" className="hm-about-text-link">
            See our approach <span>→</span>
          </a>
        </div>
      </section>

      <section className="hm-about-problem hm-about-section">
        <div className="hm-about-section-heading">
          <span className="hm-about-section-kicker">THE CHALLENGE</span>
          <h2>
            Healthcare teamwork
            <br />
            <span>needs clear handoffs.</span>
          </h2>
          <p>
            Busy shifts can make information sharing challenging. A more
            organized handoff process can help teams stay aligned.
          </p>
        </div>

        <div className="hm-about-principles">
          {principles.map((principle, index) => (
            <article
              className="hm-about-principle-card"
              key={principle.number}
              style={{ "--about-index": index }}
            >
              <span className="hm-about-principle-number">
                {principle.number}
              </span>

              <div className="hm-about-principle-icon">{principle.icon}</div>

              <h3>{principle.title}</h3>
              <p>{principle.description}</p>

              <span className="hm-about-principle-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="hm-about-approach hm-about-section" id="our-approach">
        <div className="hm-about-approach-copy">
          <span className="hm-about-section-kicker">OUR APPROACH</span>
          <h2>
            Designed around
            <br />
            <span>the handoff journey.</span>
          </h2>
          <p>
            Our approach centers on bringing key information into a more
            consistent workflow, so the next shift has a clearer starting
            point.
          </p>

          <div className="hm-about-approach-note">
            <span>✦</span>
            <p>
              The goal is not to replace clinical judgment. It is to support
              clearer communication between the people providing care.
            </p>
          </div>
        </div>

        <div className="hm-about-workflow">
          {workflow.map((step, index) => (
            <article className="hm-about-workflow-step" key={step.number}>
              <div className="hm-about-workflow-number">{step.number}</div>

              <div className="hm-about-workflow-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>

              {index < workflow.length - 1 && (
                <span className="hm-about-workflow-line" />
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="hm-about-vision hm-about-section" id="our-vision">
        <div className="hm-about-vision-decoration hm-about-vision-decoration-one" />
        <div className="hm-about-vision-decoration hm-about-vision-decoration-two" />

        <div className="hm-about-vision-content">
          <span className="hm-about-vision-kicker">OUR VISION</span>
          <h2>
            A more connected
            <br />
            future for care.
          </h2>
          <p>
            We envision healthcare teams working with greater clarity,
            confidence and coordination—one handoff at a time.
          </p>

          <Link to="/signup" className="hm-about-vision-button">
            Join the journey <span>→</span>
          </Link>
        </div>

        <div className="hm-about-vision-symbol" aria-hidden="true">
          <div className="hm-about-vision-ring hm-about-vision-ring-one" />
          <div className="hm-about-vision-ring hm-about-vision-ring-two" />
          <div className="hm-about-vision-center">✚</div>
          <span className="hm-about-vision-orbit-dot" />
        </div>
      </section>

      <footer className="hm-about-footer">
        <Link to="/home" className="hm-about-brand hm-about-footer-brand">
          <span className="hm-about-brand-icon">✚</span>
          <span>
            Handover<span>Mind</span>
          </span>
        </Link>

        <p>Thoughtful handoffs. More connected care.</p>

        <div className="hm-about-footer-links">
          <Link to="/home">Home</Link>
          <a href="#our-mission">Mission</a>
          <Link to="/">Log in</Link>
        </div>

        <span className="hm-about-copyright">
          © {new Date().getFullYear()} HandoverMind
        </span>
      </footer>
    </main>
  );
}

export default About;