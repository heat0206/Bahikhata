import { BriefcaseMetal } from '@phosphor-icons/react'

function Header({ totalApplications }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-mark">PB</div>
        <div className="header-text-group">
          <p className="app-eyebrow">PrepBoard</p>
          <h1 className="app-title">Application Tracker</h1>
        </div>
      </div>

      <div className="header-meta">
        {totalApplications > 0 && (
          <div className="header-stat-chip">
            <BriefcaseMetal size={14} weight="bold" />
            <strong>{totalApplications}</strong>
            <span>{totalApplications === 1 ? 'Application' : 'Applications'}</span>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
