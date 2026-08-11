import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardText,
  ChartLineUp,
  Robot,
  Table,
  PlusCircle,
  ChatCircleDots,
  ArrowRight,
  Sparkle,
  User,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import '../App.css';

const LandingPage = () => {
  return (
    <div className="app-shell">
      {/* ─── Header ─── */}
      <header className="app-header" style={{ justifyContent: 'space-between' }}>
        <div className="header-brand">
          <div className="landing-logo-mark">PB</div>
          <div className="header-text-group">
            <p className="app-eyebrow">PrepBoard</p>
            <h1 className="app-title">Application Tracker</h1>
          </div>
        </div>
        <div className="header-meta" style={{ gap: '12px' }}>
          <Link to="/login" className="btn-outline landing-btn">Log In</Link>
          <Link to="/signup" className="btn-green landing-btn">Sign Up</Link>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <main className="landing-hero">
        <div className="landing-hero-badge">
          <Sparkle size={14} weight="fill" />
          <span>AI-Powered Application Tracker</span>
        </div>

        <h2 className="landing-title">
          Your command center for<br />
          <span className="landing-title-highlight">internship &amp; interview</span> applications.
        </h2>
        <p className="landing-desc">
          PrepBoard helps you track applications, manage interviews, and monitor progress.
          Stop using messy spreadsheets — organize your job hunt in one place.
        </p>

        <div className="landing-actions">
          <Link to="/signup" className="btn-green landing-btn landing-btn-lg">
            Get Started for Free
            <ArrowRight size={18} weight="bold" />
          </Link>
          <Link to="/login" className="btn-outline landing-btn landing-btn-lg">Log In</Link>
        </div>

        {/* ─── Feature Cards ─── */}
        <div className="landing-features">
          <div className="feature-card feature-card--green">
            <div className="feature-icon-wrapper feature-icon--green">
              <ClipboardText size={28} weight="fill" />
            </div>
            <h3 className="feature-title">Application Tracking</h3>
            <p className="feature-desc">
              Keep all your job applications organized with statuses, dates, and important notes.
            </p>
          </div>

          <div className="feature-card feature-card--blue">
            <div className="feature-icon-wrapper feature-icon--blue">
              <ChartLineUp size={28} weight="fill" />
            </div>
            <h3 className="feature-title">Analytics &amp; Insights</h3>
            <p className="feature-desc">
              Visualize your progress with automated charts showing your application pipeline.
            </p>
          </div>

          <div className="feature-card feature-card--orange">
            <div className="feature-icon-wrapper feature-icon--orange">
              <Robot size={28} weight="fill" />
            </div>
            <h3 className="feature-title">AI Assistant</h3>
            <p className="feature-desc">
              Manage your applications via natural language. Just tell the chatbot what you applied for.
            </p>
          </div>
        </div>

        {/* ─── Zigzag Demo Timeline ─── */}
        <section className="demo-timeline-section">
          <h2 className="demo-section-title">How It Works</h2>
          <p className="demo-section-subtitle">Three simple steps to master your job hunt</p>

          <div className="demo-timeline">
            {/* Step 1 — Dashboard List (image left, text right) */}
            <div className="demo-step demo-step--left">
              <div className="demo-step-number demo-step-number--green">1</div>
              <div className="demo-step-content">
                <div className="demo-mockup demo-mockup--dashboard">
                  <div className="mockup-header">
                    <div className="mockup-dot mockup-dot--red"></div>
                    <div className="mockup-dot mockup-dot--yellow"></div>
                    <div className="mockup-dot mockup-dot--green"></div>
                    <span className="mockup-title-bar">
                      <Table size={14} weight="bold" /> Dashboard
                    </span>
                  </div>
                  <div className="mockup-body">
                    <table className="mockup-table">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Google</strong></td>
                          <td>SDE Intern</td>
                          <td><span className="mock-badge mock-badge--green">Interview</span></td>
                        </tr>
                        <tr>
                          <td><strong>Amazon</strong></td>
                          <td>SDE Intern</td>
                          <td><span className="mock-badge mock-badge--blue">Applied</span></td>
                        </tr>
                        <tr>
                          <td><strong>Microsoft</strong></td>
                          <td>PM Intern</td>
                          <td><span className="mock-badge mock-badge--orange">OA</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="demo-step-text">
                  <h3 className="demo-step-heading">
                    <ClipboardText size={22} weight="fill" className="demo-step-icon demo-step-icon--green" />
                    Track Every Application
                  </h3>
                  <p className="demo-step-desc">
                    See all your applied companies at a glance — company name, role, status, and dates — all in a clean, sortable table. No more lost spreadsheets.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 — Add Company Form (text left, image right) */}
            <div className="demo-step demo-step--right">
              <div className="demo-step-number demo-step-number--blue">2</div>
              <div className="demo-step-content">
                <div className="demo-step-text">
                  <h3 className="demo-step-heading">
                    <PlusCircle size={22} weight="fill" className="demo-step-icon demo-step-icon--blue" />
                    Add Applications Easily
                  </h3>
                  <p className="demo-step-desc">
                    Add a new application in seconds with our simple form. Fill in the company, role, status, and any notes — done!
                  </p>
                </div>
                <div className="demo-mockup demo-mockup--form">
                  <div className="mockup-header">
                    <div className="mockup-dot mockup-dot--red"></div>
                    <div className="mockup-dot mockup-dot--yellow"></div>
                    <div className="mockup-dot mockup-dot--green"></div>
                    <span className="mockup-title-bar">
                      <PlusCircle size={14} weight="bold" /> Add Application
                    </span>
                  </div>
                  <div className="mockup-body mockup-form-body">
                    <div className="mock-field">
                      <label className="mock-label">Company Name</label>
                      <div className="mock-input">Netflix</div>
                    </div>
                    <div className="mock-field">
                      <label className="mock-label">Role / Position</label>
                      <div className="mock-input">Frontend Intern</div>
                    </div>
                    <div className="mock-field-row">
                      <div className="mock-field">
                        <label className="mock-label">Status</label>
                        <div className="mock-input mock-select">Applied ▾</div>
                      </div>
                      <div className="mock-field">
                        <label className="mock-label">Date</label>
                        <div className="mock-input">2026-08-11</div>
                      </div>
                    </div>
                    <div className="mock-btn-row">
                      <span className="mock-btn mock-btn--outline">Cancel</span>
                      <span className="mock-btn mock-btn--primary">Save Application</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 — AI Chatbot (image left, text right) */}
            <div className="demo-step demo-step--left">
              <div className="demo-step-number demo-step-number--orange">3</div>
              <div className="demo-step-content">
                <div className="demo-mockup demo-mockup--chat">
                  <div className="mockup-header mockup-header--green">
                    <div className="mockup-dot mockup-dot--red"></div>
                    <div className="mockup-dot mockup-dot--yellow"></div>
                    <div className="mockup-dot mockup-dot--green"></div>
                    <span className="mockup-title-bar">
                      <Robot size={14} weight="bold" /> AI Assistant
                    </span>
                  </div>
                  <div className="mockup-body mockup-chat-body">
                    <div className="mock-chat-msg mock-chat-bot">
                      <div className="mock-chat-avatar mock-chat-avatar--bot">
                        <Robot size={12} weight="bold" />
                      </div>
                      <div className="mock-chat-bubble mock-chat-bubble--bot">
                        Hi! I'm your PrepBoard assistant. Try saying:<br />
                        • "I applied to Google for SDE Intern"
                      </div>
                    </div>
                    <div className="mock-chat-msg mock-chat-user">
                      <div className="mock-chat-bubble mock-chat-bubble--user">
                        I applied to Netflix for Frontend Intern
                      </div>
                      <div className="mock-chat-avatar mock-chat-avatar--user">
                        <User size={12} weight="bold" />
                      </div>
                    </div>
                    <div className="mock-chat-msg mock-chat-bot">
                      <div className="mock-chat-avatar mock-chat-avatar--bot">
                        <Robot size={12} weight="bold" />
                      </div>
                      <div className="mock-chat-bubble mock-chat-bubble--bot mock-chat-bubble--success">
                        ✅ Added <strong>Netflix</strong> — Frontend Intern (Applied)
                      </div>
                    </div>
                    <div className="mock-chat-input-bar">
                      <div className="mock-chat-input">Type a message…</div>
                      <div className="mock-chat-send">
                        <PaperPlaneTilt size={14} weight="fill" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="demo-step-text">
                  <h3 className="demo-step-heading">
                    <ChatCircleDots size={22} weight="fill" className="demo-step-icon demo-step-icon--orange" />
                    Chat with AI to Manage Apps
                  </h3>
                  <p className="demo-step-desc">
                    The AI assistant is the star feature — just type "I applied to Netflix for Frontend Intern" and it automatically creates the entry. Update statuses, delete entries, and more — all through natural conversation.
                  </p>
                  <Link to="/signup" className="demo-cta-link">
                    Try it now <ArrowRight size={16} weight="bold" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="landing-final-cta">
          <h2 className="landing-cta-title">Ready to organize your job hunt?</h2>
          <p className="landing-cta-desc">Join PrepBoard today — it's free and takes 30 seconds.</p>
          <Link to="/signup" className="btn-green landing-btn landing-btn-lg">
            Get Started <ArrowRight size={18} weight="bold" />
          </Link>
        </section>
      </main>

      <footer style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted-fg)', fontSize: '13px' }}>
        &copy; {new Date().getFullYear()} PrepBoard. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
