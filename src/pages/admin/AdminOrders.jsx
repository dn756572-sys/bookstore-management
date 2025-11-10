import React from 'react'
import AdminLayout from '../../components/common/AdminLayout'
import OrderList from '../../components/orders/OrderList'

const AdminOrders = () => {
  return (
    <AdminLayout>
      <div className="admin-orders">
        <OrderList isAdmin={true} />
      </div>
    </AdminLayout>
  )
}

export default AdminOrders