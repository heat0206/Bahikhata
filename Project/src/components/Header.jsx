import { BriefcaseMetal, SignOut } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Header({ totalApplications }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-mark">PB</div>
        <div className="header-text-group">
          <p className="app-eyebrow">PrepBoard</p>
          <h1 className="app-title">Dashboard</h1>
        </div>
      </div>

      <div className="header-meta" style={{ gap: '12px' }}>
        {totalApplications > 0 && (
          <div className="header-stat-chip">
            <BriefcaseMetal size={14} weight="bold" />
            <strong>{totalApplications}</strong>
            <span>{totalApplications === 1 ? 'Application' : 'Applications'}</span>
          </div>
        )}
        {user && (
          <button onClick={handleLogout} className="btn-logout" id="logout-btn">
            <SignOut size={16} weight="bold" /> Logout
          </button>
        )}
      </div>
    </header>
  )
}

export default Header

