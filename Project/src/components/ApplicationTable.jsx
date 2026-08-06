import AnimatedDeleteButton from './AnimatedDeleteButton'
import { getStatusClassName } from '../utils/statusHelpers'

function ApplicationTable({ filteredApplications, onOpenDetails, onDelete }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Company Name</th>
          <th>Role</th>
          <th>Status</th>
          <th>Applied On</th>
          <th>Remove</th>
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
              >
                {application.companyName}
              </button>
            </td>
            <td>{application.role}</td>
            <td>
              <span className={`status-badge ${getStatusClassName(application.status)}`}>
                {application.status}
              </span>
            </td>
            <td>{application.appliedOn}</td>
            <td>
              <AnimatedDeleteButton onClick={() => onDelete(application._id, application.companyName)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ApplicationTable
