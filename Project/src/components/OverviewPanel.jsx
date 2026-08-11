import { Briefcase } from '@phosphor-icons/react'

// Bright vibrant palette for the donut chart (matches status badge colors)
const statusColors = {
  'Applied':   '#3b82f6',  // bright blue
  'Interview': '#22c55e',  // bright green
  'OA':        '#f97316',  // bright orange
  'Hackathon': '#a855f7',  // bright purple
  'Offer':     '#f59e0b',  // bright amber
  'Rejected':  '#ef4444',  // bright red
  'Withdrawn': '#94a3b8',  // slate
  'Unknown':   '#d4d4d8',  // muted
}

function OverviewPanel({ applications }) {
  const total = applications.length
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status || 'Unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  // Ordered by presence for consistent chart slices
  const orderedKeys = ['Applied', 'Interview', 'OA', 'Hackathon', 'Offer', 'Rejected', 'Withdrawn', 'Unknown']
  const sorted = orderedKeys.filter((k) => statusCounts[k])

  let cumulative = 0
  const gradientStops = sorted.map((status) => {
    const pct = (statusCounts[status] / total) * 100
    const start = cumulative
    cumulative += pct
    const color = statusColors[status] ?? statusColors['Unknown']
    return `${color} ${start.toFixed(2)}% ${cumulative.toFixed(2)}%`
  }).join(', ')

  const donutStyle = {
    background: total > 0 ? `conic-gradient(${gradientStops})` : 'var(--color-muted)',
  }

  return (
    <div className="overview-section">
      <div className="overview-card">
        <div className="overview-card-header">
          <h3 className="overview-title">Overview</h3>
        </div>

        <div className="overview-card-body">
          {/* Total Stat */}
          <div className="stat-box">
            <div className="stat-icon">
              <Briefcase size={20} weight="fill" />
            </div>
            <div className="stat-text">
              <span className="stat-value">{total}</span>
              <span className="stat-label">Total Applications</span>
            </div>
          </div>

          {/* Donut Chart */}
          {total > 0 && (
            <div className="donut-wrapper">
              <div className="donut-chart" style={donutStyle} aria-hidden="true" />
            </div>
          )}

          {/* Legend */}
          <div className="chart-legend">
            {sorted.map((status) => {
              const count = statusCounts[status]
              const pct = Math.round((count / total) * 100)
              return (
                <div key={status} className="legend-item">
                  <span
                    className="legend-swatch"
                    style={{ backgroundColor: statusColors[status] ?? statusColors['Unknown'] }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="legend-text">
                      <span className="legend-label">{status}</span>
                      <span className="legend-count">{count}</span>
                    </div>
                    <div className="legend-bar-track">
                      <div
                        className="legend-bar-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: statusColors[status] ?? statusColors['Unknown'],
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewPanel
