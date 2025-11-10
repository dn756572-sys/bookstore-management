import React from 'react'
import AdminLayout from '../../components/common/AdminLayout'
import EmployeeList from '../../components/employees/EmployeeList'

const AdminEmployees = () => {
  return (
    <AdminLayout>
      <div className="admin-employees">
        <EmployeeList />
      </div>
    </AdminLayout>
  )
}

export default AdminEmployees