import { getStatusClassName } from '../utils/statusHelpers'

function ApplicationDetails({ application, onClose, onEdit }) {
  return (
    <div className="details-card">
      <div className="details-header">
        <div className="details-title-group">
          <h2>{application.companyName}</h2>
          <span className={`status-badge ${getStatusClassName(application.status)}`}>
            {application.status}
          </span>
        </div>
        <div className="details-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Back</button>
          <button type="button" className="btn-outline" onClick={onEdit}>Edit</button>
        </div>
      </div>

      <div className="details-content">
        <div className="details-grid">
          <div className="metadata-group">
            <span className="metadata-label">Role</span>
            <span className="metadata-value">{application.role || '—'}</span>
          </div>
          <div className="metadata-group">
            <span className="metadata-label">Location</span>
            <span className="metadata-value">{application.location || '—'}</span>
          </div>
          <div className="metadata-group">
            <span className="metadata-label">Applied Through</span>
            <span className="metadata-value">{application.appliedThrough || '—'}</span>
          </div>
          <div className="metadata-group">
            <span className="metadata-label">Applied On</span>
            <span className="metadata-value">{application.appliedOn || '—'}</span>
          </div>
          <div className="metadata-group">
            <span className="metadata-label">Job Link</span>
            <span className="metadata-value">{application.jobLink || '—'}</span>
          </div>
          <div className="metadata-group notes-group">
            <span className="metadata-label">Notes</span>
            <span className="metadata-value">{application.notes || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetails
