import { useEffect, useState } from 'react'
import './App.css'

function App() {

  const[search, setSearch] = useState("");
  const[filter, setFilter] = useState("");
  const[selectedApplication, setSelectedApplication] = useState(null);
  const[form , setForm] = useState({
    companyName: '',
    role:'',
    location:'',
    appliedThrough:'',
    appliedOn: '',
    status:'',
    jobLink:'',
    notes:'',
  })

  const [isFormOpen , setIsFormOpen] = useState(false)

  const openDetails = (application) => {
    setSelectedApplication(application)
  }

  const closeDetails = () => {
    setSelectedApplication(null)
  }


  
  const handleChange = (event) => {
    const{name,value} = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]:value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const newApplication = {
      ...form,
    }

    setApplications((curretApplications)=> [
      newApplication,
      ...curretApplications,
    ])

    setForm({
      companyName: '',
      role:'',
      location:'',
      appliedThrough:'',
      appliedOn: '',
      status:'',
      jobLink:'',
      notes:'',
    })

    setIsFormOpen(false)
  }
  
  const [applications, setApplications] = useState(() => {
    const savedApplications = localStorage.getItem('applications')
    return savedApplications ? JSON.parse(savedApplications) : [
      {
        companyName: "Google",
        role: "Summer 2027 Intern",
        status: "Applied",
        appliedOn: "2026-07-08",
      },
      {
        companyName: "JP Morgan",
        role: "SEP 2027",
        status: "Hackathon",
        appliedOn: "2026-01-08",
      },
      {
        companyName: "Microsoft",
        role: "2027 Intern",
        status: "Applied",
        appliedOn: "2026-07-15",
      }
    ]
  })

  const filteredApplications = applications.filter((application) => {
    const matchesSearch = 
      application.companyName.toLowerCase().includes(search.toLowerCase()) ||
      application.role.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = 
      filter === "" || application.status === filter

    return matchesSearch && matchesFilter
  })

  const hasSearch = search.trim() !== ""
  const isApplicationsEmpty = applications.length === 0
  const showNoSearchMatch =
    !isApplicationsEmpty && hasSearch && filteredApplications.length === 0

  const getStatusClassName = (status) => {
    if (status === 'Rejected') return 'status-rejected'
    if (status === 'Applied') return 'status-applied'
    if (status === 'Offer') return 'status-offer'
    return 'status-default'
  }

  useEffect(() => {
  localStorage.setItem(
    "applications",
    JSON.stringify(applications)
  );
}, [applications]); 

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">PrepBoard</p>
          <h1 className="app-title">Interview & Internship Application Tracker</h1>
        </div>
      </header>

      <main className="app-main">
        <section className="dashboard-card">

          {applications.length > 0 && (
            <div className="toolbar">
              
              <input
                type="text"
                placeholder="Search your Applications"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="OA">OA</option>
                <option value="Interview">Interview</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>

              <button type="button" onClick={() => setIsFormOpen(true)}>
                Add Application
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setFilter("")
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {applications.length === 0 ? (
            <div className="empty-state">
              <p>Start Tracking your Applications!</p>
              <button type="button" onClick={() => setIsFormOpen(true)}>
                Add Application
              </button>
            </div>
          ) : showNoSearchMatch ? (
            <p>No applications found matching your search criteria.</p>
          ) : (
            <>

              {selectedApplication ? (
                <div className="details-card">
                  <div className="details-header">
                    <h2>{selectedApplication.companyName}</h2>
                    <div className="details-actions">
                      <button type="button" onClick={closeDetails}>Back</button>
                      <button type="button">Edit</button>
                    </div>
                  </div>

                  <div className="details-grid">
                    <p><strong>Role:</strong> {selectedApplication.role || '—'}</p>
                    <p><strong>Location:</strong> {selectedApplication.location || '—'}</p>
                    <p><strong>Applied Through:</strong> {selectedApplication.appliedThrough || '—'}</p>
                    <p><strong>Applied On:</strong> {selectedApplication.appliedOn || '—'}</p>
                    <p><strong>Status:</strong> {selectedApplication.status || '—'}</p>
                    <p><strong>Job Link:</strong> {selectedApplication.jobLink || '—'}</p>
                    <p><strong>Notes:</strong> {selectedApplication.notes || '—'}</p>
                  </div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application.companyName}>
                      <td>
                        <button
                        type="button"
                        className="company-link"
                        onClick={() => openDetails(application)}
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
                    </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )
        }
        </section>
      </main>
        {isFormOpen && (

          <div className="modal-overlay">
            <div className="modal-card">
              <h2>Add Application</h2>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="role"
                  placeholder="Role"
                  value={form.role}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={form.location}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="appliedThrough"
                  placeholder="Applied Through"
                  value={form.appliedThrough}
                  onChange={handleChange}
                />

                <input
                  type="date"
                  name="appliedOn"
                  value={form.appliedOn}
                  onChange={handleChange}
                />

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
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
                  onChange={handleChange}
                />

                <textarea
                  name="notes"
                  placeholder="Notes"
                  value={form.notes}
                  onChange={handleChange}
                />

                <div className="modal-actions">
                  <button type="button" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}

export default App