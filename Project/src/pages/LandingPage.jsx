import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardText, ChartLineUp, Robot } from '@phosphor-icons/react';
import '../App.css'; 

const LandingPage = () => {
  return (
    <div className="app-shell">
      <header className="app-header" style={{ justifyContent: 'space-between' }}>
        <div className="header-brand">
          <div className="header-logo-mark">PB</div>
          <div className="header-text-group">
            <p className="app-eyebrow">PrepBoard</p>
            <h1 className="app-title">Application Tracker</h1>
          </div>
        </div>
        <div className="header-meta" style={{ gap: '16px' }}>
          <Link to="/login" className="btn-outline">Log In</Link>
          <Link to="/signup" className="btn-green">Sign Up</Link>
        </div>
      </header>

      <main className="landing-hero">
        <h2 className="landing-title">
          Your command center for internship <br /> and interview applications.
        </h2>
        <p className="landing-desc">
          PrepBoard helps you track applications, manage interviews, and monitor progress. Stop using messy spreadsheets and organize your job hunt in one place.
        </p>
        
        <div className="landing-actions">
          <Link to="/signup" className="btn-green">Get Started for Free</Link>
          <Link to="/login" className="btn-outline">Log In</Link>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ClipboardText size={28} weight="fill" />
            </div>
            <h3 className="feature-title">Application Tracking</h3>
            <p className="feature-desc">Keep all your job applications organized with statuses, dates, and important notes.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ChartLineUp size={28} weight="fill" />
            </div>
            <h3 className="feature-title">Analytics & Insights</h3>
            <p className="feature-desc">Visualize your progress with automated charts showing your application pipeline.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Robot size={28} weight="fill" />
            </div>
            <h3 className="feature-title">AI Assistant</h3>
            <p className="feature-desc">Manage your applications via natural language. Just tell the chatbot what you applied for.</p>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted-fg)', fontSize: '13px' }}>
        &copy; {new Date().getFullYear()} PrepBoard. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
