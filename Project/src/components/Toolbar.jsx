import { MagnifyingGlass, Plus, X } from '@phosphor-icons/react'

function Toolbar({ search, setSearch, filter, setFilter, onAddApplication }) {
  const hasFilters = search.trim() !== '' || filter !== ''

  return (
    <div className="toolbar">
      <div className="toolbar-controls">
        <div className="search-wrapper">
          <span className="search-icon">
            <MagnifyingGlass size={16} weight="bold" />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search companies or roles…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search applications"
          />
        </div>

        <select
          className="filter-select"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter by status"
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

        {hasFilters && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => { setSearch(''); setFilter('') }}
            aria-label="Clear all filters"
          >
            <X size={14} weight="bold" />
            Clear
          </button>
        )}
      </div>

      <div className="toolbar-actions">
        <button
          type="button"
          className="btn-accent"
          onClick={onAddApplication}
          id="add-application-btn"
        >
          <Plus size={16} weight="bold" />
          Add Application
        </button>
      </div>
    </div>
  )
}

export default Toolbar
