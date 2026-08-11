import { BriefcaseMetal, SignOut } from '@phosphor-icons/react'
import { useAuth } from '../contexts/AuthContext'

function Header({ totalApplications }) {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-mark">PB</div>
        <div className="header-text-group">
          <p className="app-eyebrow">PrepBoard</p>
          <h1 className="app-title">Dashboard</h1>
        </div>
      </div>

      <div className="header-meta flex gap-4 items-center">
        {totalApplications > 0 && (
          <div className="header-stat-chip">
            <BriefcaseMetal size={14} weight="bold" />
            <strong>{totalApplications}</strong>
            <span>{totalApplications === 1 ? 'Application' : 'Applications'}</span>
          </div>
        )}
        {user && (
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <SignOut size={16} /> Logout
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
