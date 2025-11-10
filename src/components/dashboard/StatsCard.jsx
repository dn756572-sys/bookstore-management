import React from 'react'

const StatsCard = ({ title, value, type, icon }) => {
  const formatValue = () => {
    switch (type) {
      case 'revenue':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(value)
      default:
        return value.toLocaleString('vi-VN')
    }
  }

  const getTrendColor = () => {
    const colors = {
      revenue: '#10b981',
      orders: '#3b82f6',
      books: '#8b5cf6',
      customers: '#f59e0b'
    }
    return colors[type] || '#6b7280'
  }

  return (
    <div className="stats-card" style={{ borderLeftColor: getTrendColor() }}>
      <div className="stats-content">
        <div className="stats-icon" style={{ backgroundColor: getTrendColor() }}>
          {icon}
        </div>
        <div className="stats-info">
          <h3>{formatValue()}</h3>
          <p>{title}</p>
        </div>
      </div>
    </div>
  )
}

export default StatsCard