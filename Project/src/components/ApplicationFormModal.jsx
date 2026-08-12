import { X } from '@phosphor-icons/react'

const formFields = [
  { name: 'companyName',    label: 'Company Name',    type: 'text',   placeholder: 'e.g. Google' },
  { name: 'role',           label: 'Role',            type: 'text',   placeholder: 'e.g. Software Engineer Intern' },
  { name: 'location',       label: 'Location',        type: 'text',   placeholder: 'e.g. New York, NY' },
  { name: 'appliedThrough', label: 'Applied Through',  type: 'text',   placeholder: 'e.g. LinkedIn, Company Site' },
  { name: 'appliedOn',      label: 'Applied On',       type: 'date',   placeholder: '' },
  { name: 'jobLink',        label: 'Job Link',         type: 'text',   placeholder: 'https://...' },
]

const statusOptions = ['Applied', 'OA - Upcoming', 'OA - Completed', 'Interview', 'Hackathon', 'Offer', 'Rejected', 'Withdrawn']

function ApplicationFormModal({ editingId, form, onChange, onSubmit, onCancel }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="modal-title">{editingId ? 'Edit Application' : 'Add Application'}</h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={onCancel}
            aria-label="Close modal"
            style={{ width: 34, height: 34, padding: 0 }}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={onSubmit} id="application-form">
            <div className="form-grid">
              {formFields.map(({ name, label, type, placeholder }) => (
                <div className="form-field" key={name}>
                  <label className="form-label" htmlFor={`field-${name}`}>{label}</label>
                  <input
                    id={`field-${name}`}
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={form[name] ?? ''}
                    onChange={onChange}
                    autoComplete="off"
                  />
                </div>
              ))}

              <div className="form-field">
                <label className="form-label" htmlFor="field-status">Status</label>
                <select
                  id="field-status"
                  name="status"
                  value={form.status ?? ''}
                  onChange={onChange}
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.status === 'OA - Upcoming' && (
              <div className="form-grid" style={{ marginTop: 'var(--space-4)' }}>
                <div className="form-field">
                  <label className="form-label" htmlFor="field-oaDate">OA Date</label>
                  <input
                    id="field-oaDate"
                    type="date"
                    name="oaDate"
                    value={form.oaDate ?? ''}
                    onChange={onChange}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="field-oaTime">OA Time (HH:mm)</label>
                  <input
                    id="field-oaTime"
                    type="time"
                    name="oaTime"
                    value={form.oaTime ?? ''}
                    onChange={onChange}
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="field-notes">Notes</label>
              <textarea
                id="field-notes"
                name="notes"
                placeholder="Interview rounds, recruiter contact, links, or any notes…"
                value={form.notes ?? ''}
                onChange={onChange}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" form="application-form">
            {editingId ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationFormModal
