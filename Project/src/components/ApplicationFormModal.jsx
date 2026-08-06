function ApplicationFormModal({ editingId, form, onChange, onSubmit, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{editingId ? 'Edit Application' : 'Add Application'}</h2>

        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={form.companyName}
              onChange={onChange}
            />

            <input
              type="text"
              name="role"
              placeholder="Role"
              value={form.role}
              onChange={onChange}
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={onChange}
            />

            <input
              type="text"
              name="appliedThrough"
              placeholder="Applied Through"
              value={form.appliedThrough}
              onChange={onChange}
            />

            <input
              type="date"
              name="appliedOn"
              value={form.appliedOn}
              onChange={onChange}
            />

            <select
              name="status"
              value={form.status}
              onChange={onChange}
            >
              <option value="">Select Status</option>
              <option value="Applied">Applied</option>
              <option value="OA">OA</option>
              <option value="Interview">Interview</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>

            <input
              type="text"
              name="jobLink"
              placeholder="Job Link"
              value={form.jobLink}
              onChange={onChange}
            />
          </div>

          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={onChange}
          />

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplicationFormModal
