import { useState } from 'react'
import './App.css'

function App() {

  const[search, setSearch] = useState("");
  const[filter, setFilter] = useState("");
  
  const applications  = [
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
            <p>Start Tracking your Applications!</p>
          ) : showNoSearchMatch ? (
            <p>No applications found matching your search criteria.</p>
          ) : (
            <>

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
                    <td>{application.companyName}</td>
                    <td>{application.role}</td>
                    <td>{application.status}</td>
                    <td>{application.appliedOn}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </>
          )
        }
        </section>
      </main>
    </div>
  )
}

export default App