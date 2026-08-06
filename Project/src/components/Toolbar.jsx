function Toolbar({ search, setSearch, filter, setFilter, onAddApplication }) {
  return (
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
        <button type="button" className="btn-primary" onClick={onAddApplication}>
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
  )
}

export default Toolbar
