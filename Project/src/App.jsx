import { useEffect, useState, useRef } from 'react'
import Lottie from 'lottie-react'
import './App.css'
import trashBinAnimation from './assets/trash-bin.json'

const LottieComponent = Lottie.default || Lottie;

function AnimatedDeleteButton({ onClick }) {
  const lottieRef = useRef(null);

  const handleMouseEnter = () => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (lottieRef.current) {
      lottieRef.current.stop();
    }
  };

  return (
    <button
      type="button"
      className="btn-ghost delete-btn"
      onClick={onClick}
      title="Delete Application"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <LottieComponent
        lottieRef={lottieRef}
        animationData={trashBinAnimation}
        loop={true}
        autoplay={false}
        style={{ width: 24, height: 24 }}
      />
    </button>
  );
}

// --- API Helper Functions ---
// Each function talks to the Express backend via the Vite proxy.
// All endpoints return { success: true, data: ... } or { success: false, message: "..." }

const API_URL = '/api/applications';

async function fetchApplications() {
  const res = await fetch(API_URL);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function createApplication(applicationData) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applicationData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function updateApplication(id, applicationData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applicationData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

async function deleteApplication(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

function App() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState(null); // Tracks _id of the application being edited
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [form, setForm] = useState({
    companyName: '',
    role: '',
    location: '',
    appliedThrough: '',
    appliedOn: '',
    status: '',
    jobLink: '',
    notes: '',
  })

  const resetForm = () => {
    setForm({
      companyName: '',
      role: '',
      location: '',
      appliedThrough: '',
      appliedOn: '',
      status: '',
      jobLink: '',
      notes: '',
    })
    setEditingId(null)
  }

  const openEditForm = () => {
    setForm(selectedApplication);
    setEditingId(selectedApplication._id); // Track by MongoDB _id

    setIsFormOpen(true);
  }


  const [isFormOpen, setIsFormOpen] = useState(false)

  const openDetails = (application) => {
    setSelectedApplication(application)
  }

  const closeDetails = () => {
    setSelectedApplication(null)
  }



  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      if (editingId) {
        // UPDATE: send PUT request, then re-fetch all applications
        await updateApplication(editingId, form)
      } else {
        // CREATE: send POST request, then re-fetch all applications
        await createApplication(form)
      }

      // Re-fetch from the database (single source of truth)
      const fresh = await fetchApplications()
      setApplications(fresh)

      // If we were editing, update the selected application with fresh data
      if (editingId) {
        const updated = fresh.find((app) => app._id === editingId)
        setSelectedApplication(updated || null)
      }
    } catch (error) {
      console.error('Failed to save application:', error.message)
    }

    resetForm()
    setIsFormOpen(false)
  }

  const handleDelete = async (id, companyName) => {
    if (window.confirm(`Are you sure you want to delete the application for ${companyName}?`)) {
      try {
        await deleteApplication(id)

        // Re-fetch from the database (single source of truth)
        const fresh = await fetchApplications()
        setApplications(fresh)

        if (selectedApplication?._id === id) {
          setSelectedApplication(null);
        }
      } catch (error) {
        console.error('Failed to delete application:', error.message)
      }
    }
  }

  // Initialize with an empty array — data is fetched from the backend on mount
  const [applications, setApplications] = useState([])

  // Fetch all applications from MongoDB when the component mounts
  useEffect(() => {
    fetchApplications()
      .then((data) => setApplications(data))
      .catch((error) => console.error('Failed to load applications:', error.message))
  }, [])

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (application.role && application.role.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter =
      filter === "" || application.status === filter

    return matchesSearch && matchesFilter
  })

  const hasSearch = search.trim() !== ""
  const isApplicationsEmpty = applications.length === 0
  const showNoSearchMatch =
    !isApplicationsEmpty && hasSearch && filteredApplications.length === 0

  const getStatusClassName = (status) => {
    if (!status) return 'status-default';
    return `status-${status.toLowerCase()}`;
  }

  // --- STATS & CHART CALCULATIONS ---
  const totalApplications = applications.length;
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    'Applied': '#000000',
    'Offer': '#333333',
    'Interview': '#555555',
    'OA': '#777777',
    'Hackathon': '#999999',
    'Rejected': '#cccccc',
    'Withdrawn': '#e5e5e5',
    'Unknown': '#f5f5f5'
  };

  let cumulativePercent = 0;
  const gradientStops = Object.entries(statusCounts).map(([status, count]) => {
    const percent = (count / totalApplications) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    const color = statusColors[status] || statusColors['Unknown'];
    return `${color} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  const donutStyle = {
    background: totalApplications > 0 ? `conic-gradient(${gradientStops})` : '#f5f5f5'
  };
  // ----------------------------------

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <p className="app-eyebrow">PREPBOARD</p>
          <h1 className="app-title">Interview & Internship Application Tracker</h1>
        </div>
      </header>

      <main className="app-main">
        <section className="dashboard-card">

          {applications.length > 0 && (
            <div className="toolbar">
              <div className="toolbar-controls">
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
              </div>

              <div className="toolbar-actions">
                <button type="button" className="btn-primary" onClick={() => {
                  resetForm()
                  setIsFormOpen(true)
                }}>
                  Add Application
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setSearch("")
                    setFilter("")
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {applications.length === 0 ? (
            <div className="empty-state">
              <p>Start Tracking your Applications!</p>
              <button type="button" className="btn-primary" onClick={() => {
                resetForm()
                setIsFormOpen(true)
              }}>
                Add Application
              </button>
            </div>
          ) : showNoSearchMatch ? (
            <p>No applications found matching your search criteria.</p>
          ) : (
            <div className="content-grid">
              <div className="table-section">
                {selectedApplication ? (
                  <div className="details-card">
                    <div className="details-header">
                      <div className="details-title-group">
                        <h2>{selectedApplication.companyName}</h2>
                        <span className={`status-badge ${getStatusClassName(selectedApplication.status)}`}>
                          {selectedApplication.status}
                        </span>
                      </div>
                      <div className="details-actions">
                        <button type="button" className="btn-ghost" onClick={closeDetails}>Back</button>
                        <button type="button" className="btn-outline" onClick={openEditForm}>Edit</button>
                      </div>
                    </div>

                    <div className="details-content">
                      <div className="details-grid">
                        <div className="metadata-group">
                          <span className="metadata-label">Role</span>
                          <span className="metadata-value">{selectedApplication.role || '—'}</span>
                        </div>
                        <div className="metadata-group">
                          <span className="metadata-label">Location</span>
                          <span className="metadata-value">{selectedApplication.location || '—'}</span>
                        </div>
                        <div className="metadata-group">
                          <span className="metadata-label">Applied Through</span>
                          <span className="metadata-value">{selectedApplication.appliedThrough || '—'}</span>
                        </div>
                        <div className="metadata-group">
                          <span className="metadata-label">Applied On</span>
                          <span className="metadata-value">{selectedApplication.appliedOn || '—'}</span>
                        </div>
                        <div className="metadata-group">
                          <span className="metadata-label">Job Link</span>
                          <span className="metadata-value">{selectedApplication.jobLink || '—'}</span>
                        </div>
                        <div className="metadata-group notes-group">
                          <span className="metadata-label">Notes</span>
                          <span className="metadata-value">{selectedApplication.notes || '—'}</span>
                        </div>
                      </div>
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
                          <td>
                            <AnimatedDeleteButton onClick={() => handleDelete(application._id, application.companyName)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="overview-section">
                <div className="overview-card">
                  <h3 className="overview-title">Overview</h3>
                  <div className="stat-box">
                    <span className="stat-value">{totalApplications}</span>
                    <span className="stat-label">Total Applications</span>
                  </div>

                  <div className="donut-wrapper">
                    <div className="donut-chart" style={donutStyle}></div>
                  </div>

                  <div className="chart-legend">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: statusColors[status] || statusColors['Unknown'] }}></span>
                        <div className="legend-text">
                          <span className="legend-label">{status}</span>
                          <span className="legend-count">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
          }
        </section>
      </main>
      {isFormOpen && (

        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{editingId ? 'Edit Application' : 'Add Application'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
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
              </div>

              <textarea
                name="notes"
                placeholder="Notes"
                value={form.notes}
                onChange={handleChange}
              />

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => {
                  resetForm()
                  setIsFormOpen(false)
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App