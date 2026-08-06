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

function OverviewPanel({ applications }) {
  const totalApplications = applications.length;
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

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

  return (
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
  )
}

export default OverviewPanel
