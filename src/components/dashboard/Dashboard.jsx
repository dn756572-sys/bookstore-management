import React, { useState, useEffect } from 'react'
import { orderService } from '../../services/orderService'
import { bookService } from '../../services/bookService'
import { customerService } from '../../services/customerService'
import StatsCard from './StatsCard'
import RevenueChart from './RevenueChart'
import RecentOrders from './RecentOrders'
import LoadingSpinner from '../common/LoadingSpinner'

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // In a real app, you would have a dedicated dashboard endpoint
      // For now, we'll simulate with multiple API calls
      const [orders, books, customers] = await Promise.all([
        orderService.getAllOrders({ limit: 100 }),
        bookService.getAllBooks(),
        customerService.getAllCustomers()
      ])

      const totalRevenue = orders.data?.reduce((sum, order) => sum + order.tongTien, 0) || 0
      const totalOrders = orders.data?.length || 0
      const totalBooks = books.length || 0
      const totalCustomers = customers.length || 0

      setStats({
        totalRevenue,
        totalOrders,
        totalBooks,
        totalCustomers,
        recentOrders: orders.data?.slice(0, 5) || []
      })
    } catch (err) {
      setError('Lỗi tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Đang tải dashboard..." />

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống quản lý nhà sách</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <StatsCard
          title="Tổng doanh thu"
          value={stats.totalRevenue}
          type="revenue"
          icon="💰"
        />
        <StatsCard
          title="Tổng đơn hàng"
          value={stats.totalOrders}
          type="orders"
          icon="📦"
        />
        <StatsCard
          title="Tổng sách"
          value={stats.totalBooks}
          type="books"
          icon="📚"
        />
        <StatsCard
          title="Tổng khách hàng"
          value={stats.totalCustomers}
          type="customers"
          icon="👥"
        />
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <RevenueChart />
        </div>
        
        <div className="recent-orders-section">
          <RecentOrders orders={stats.recentOrders} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard