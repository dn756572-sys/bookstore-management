import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/books', label: 'Quản lý Sách', icon: '📚' },
    { path: '/admin/categories', label: 'Danh mục', icon: '📑' },
    { path: '/admin/customers', label: 'Khách hàng', icon: '👥' },
    { path: '/admin/employees', label: 'Nhân viên', icon: '👨‍💼' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>BookStore Admin</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar