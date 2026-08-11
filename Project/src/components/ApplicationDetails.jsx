import { ArrowLeft, PencilSimple, Link, MapPin, Calendar, Briefcase, FileText } from '@phosphor-icons/react'
import { getStatusClassName } from '../utils/statusHelpers'

const fieldConfig = [
  { key: 'role',           label: 'Role',            icon: Briefcase   },
  { key: 'location',       label: 'Location',        icon: MapPin      },
  { key: 'appliedThrough', label: 'Applied Through',  icon: FileText    },
  { key: 'appliedOn',      label: 'Applied On',       icon: Calendar    },
  { key: 'jobLink',        label: 'Job Link',         icon: Link        },
]

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
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Back to list">
            <ArrowLeft size={15} weight="bold" />
            Back
          </button>
          <button type="button" className="btn-outline" onClick={onEdit} aria-label="Edit application">
            <PencilSimple size={14} weight="bold" />
            Edit
          </button>
        </div>
      </div>

      <div className="details-content">
        <div className="details-grid">
          {fieldConfig.map(({ key, label }) => (
            <div className="metadata-group" key={key}>
              <span className="metadata-label">{label}</span>
              <span className="metadata-value">
                {key === 'jobLink' && application[key]
                  ? <a
                      href={application[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--color-accent)',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                        fontWeight: 600,
                        fontSize: 'var(--text-sm)',
                        wordBreak: 'break-all'
                      }}
                    >
                      {application[key]}
                    </a>
                  : application[key] || <span style={{ color: 'var(--color-muted-fg)' }}>—</span>
                }
              </span>
            </div>
          ))}

          {application.notes && (
            <div className="metadata-group notes-group">
              <span className="metadata-label">Notes</span>
              <span className="metadata-value" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {application.notes}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetails
