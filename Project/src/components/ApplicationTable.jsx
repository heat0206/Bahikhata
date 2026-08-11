import AnimatedDeleteButton from './AnimatedDeleteButton'
import { getStatusClassName } from '../utils/statusHelpers'

function ApplicationTable({ filteredApplications, onOpenDetails, onDelete }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Status</th>
            <th>Applied On</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>

        <tbody>
          {filteredApplications.map((application) => (
            <tr key={application._id}>
              <td>
                <button
                  type="button"
                  className="company-link"
                  onClick={() => onOpenDetails(application)}
                  id={`app-row-${application._id}`}
                >
                  {application.companyName}
                </button>
              </td>
              <td>{application.role || <span style={{ color: 'var(--color-muted-fg)' }}>—</span>}</td>
              <td>
                <span className={`status-badge ${getStatusClassName(application.status)}`}>
                  {application.status}
                </span>
              </td>
              <td style={{ color: 'var(--color-fg-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {application.appliedOn || '—'}
              </td>
              <td style={{ width: 50 }}>
                <AnimatedDeleteButton
                  onClick={() => onDelete(application._id, application.companyName)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ApplicationTable
