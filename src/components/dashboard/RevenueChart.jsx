import React from 'react'

const RevenueChart = () => {
  // This is a simplified chart component
  // In a real app, you would use Chart.js or similar library
  
  const sampleData = [
    { month: 'Th1', revenue: 5000000 },
    { month: 'Th2', revenue: 8000000 },
    { month: 'Th3', revenue: 12000000 },
    { month: 'Th4', revenue: 9000000 },
    { month: 'Th5', revenue: 15000000 },
    { month: 'Th6', revenue: 11000000 }
  ]

  const maxRevenue = Math.max(...sampleData.map(d => d.revenue))

  return (
    <div className="revenue-chart">
      <h3>Doanh thu 6 tháng gần đây</h3>
      <div className="chart-container">
        {sampleData.map((data, index) => (
          <div key={index} className="chart-bar-container">
            <div 
              className="chart-bar"
              style={{ 
                height: `${(data.revenue / maxRevenue) * 100}%` 
              }}
            >
              <span className="bar-value">
                {(data.revenue / 1000000).toFixed(1)}M
              </span>
            </div>
            <span className="bar-label">{data.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RevenueChart