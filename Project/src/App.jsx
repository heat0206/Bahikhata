import { useState } from 'react'
import './App.css'
import { useApplications } from './hooks/useApplications'
import { useApplicationForm } from './hooks/useApplicationForm'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import ApplicationTable from './components/ApplicationTable'
import ApplicationDetails from './components/ApplicationDetails'
import ApplicationFormModal from './components/ApplicationFormModal'
import OverviewPanel from './components/OverviewPanel'
import ChatPanel from './components/ChatPanel'
import { ClipboardText, Plus } from '@phosphor-icons/react'

function App() {
  // --- Data & CRUD ---
  const { applications, refreshApplications, addApplication, editApplication, removeApplication } = useApplications()

  // --- Form & Modal ---
  const { form, editingId, isFormOpen, handleChange, openAddForm, openEditForm, closeForm } = useApplicationForm()

  // --- Search & Filter (local UI state, stays in App) ---
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("")

  // --- Selection (drives table ↔ detail view toggle) ---
  const [selectedApplication, setSelectedApplication] = useState(null)

  // --- Derived data ---
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (application.role && application.role.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter =
      filter === "" || application.status === filter
    return matchesSearch && matchesFilter
  })

  const hasSearch = search.trim() !== ""
  const showNoSearchMatch =
    applications.length > 0 && hasSearch && filteredApplications.length === 0

  // --- Event handlers that orchestrate between hooks ---
  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      let fresh
      if (editingId) {
        fresh = await editApplication(editingId, form)
        const updated = fresh.find((app) => app._id === editingId)
        setSelectedApplication(updated || null)
      } else {
        fresh = await addApplication(form)
      }
    } catch (error) {
      console.error('Failed to save application:', error.message)
    }
    closeForm()
  }

  const handleDelete = async (id, companyName) => {
    try {
      const result = await removeApplication(id, companyName)
      if (result && selectedApplication?._id === id) {
        setSelectedApplication(null)
      }
    } catch (error) {
      console.error('Failed to delete application:', error.message)
    }
  }

  return (
    <div className="app-shell">
      <Header totalApplications={applications.length} />

      <main className="app-main">
        <section className="dashboard-card">

          {applications.length > 0 && (
            <Toolbar
              search={search}
              setSearch={setSearch}
              filter={filter}
              setFilter={setFilter}
              onAddApplication={openAddForm}
            />
          )}

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ClipboardText size={28} weight="light" />
              </div>
              <p className="empty-state-title">No applications yet</p>
              <p className="empty-state-desc">
                Start tracking your internship and job applications in one place.
              </p>
              <button type="button" className="btn-accent" onClick={openAddForm} id="first-add-btn">
                <Plus size={16} weight="bold" />
                Add Your First Application
              </button>
            </div>
          ) : showNoSearchMatch ? (
            <p className="no-results">No applications match your search or filter.</p>
          ) : (
            <div className="content-grid">
              <div className="table-section">
                {selectedApplication ? (
                  <ApplicationDetails
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onEdit={() => openEditForm(selectedApplication)}
                  />
                ) : (
                  <ApplicationTable
                    filteredApplications={filteredApplications}
                    onOpenDetails={(app) => setSelectedApplication(app)}
                    onDelete={handleDelete}
                  />
                )}
              </div>

              <OverviewPanel applications={applications} />
            </div>
          )}
        </section>
      </main>

      {isFormOpen && (
        <ApplicationFormModal
          editingId={editingId}
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      <ChatPanel onRefreshApplications={refreshApplications} />
    </div>
  )
}

export default App