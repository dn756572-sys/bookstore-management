import React from 'react'
import AdminLayout from '../../components/common/AdminLayout'
import CustomerList from '../../components/customers/CustomerList'

const AdminCustomers = () => {
  return (
    <AdminLayout>
      <div className="admin-customers">
        <CustomerList />
      </div>
    </AdminLayout>
  )
}

export default AdminCustomers