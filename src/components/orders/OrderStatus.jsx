import React from 'react'

const OrderStatus = ({ status }) => {
  const statusConfig = {
    ChoXacNhan: {
      label: 'Chờ xác nhận',
      color: 'warning',
      icon: '⏳'
    },
    DangXuLy: {
      label: 'Đang xử lý',
      color: 'info',
      icon: '🔧'
    },
    DangGiao: {
      label: 'Đang giao',
      color: 'primary',
      icon: '🚚'
    },
    HoanThanh: {
      label: 'Hoàn thành',
      color: 'success',
      icon: '✅'
    },
    Huy: {
      label: 'Đã hủy',
      color: 'danger',
      icon: '❌'
    }
  }

  const config = statusConfig[status] || { label: status, color: 'default', icon: '❓' }

  return (
    <span className={`order-status ${config.color}`}>
      <span className="status-icon">{config.icon}</span>
      {config.label}
    </span>
  )
}

export default OrderStatus