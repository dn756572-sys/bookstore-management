import React from 'react'
import AdminLayout from '../../components/common/AdminLayout'
import CategoryList from '../../components/categories/CategoryList'

const AdminCategories = () => {
  return (
    <AdminLayout>
      <div className="admin-categories">
        <CategoryList />
      </div>
    </AdminLayout>
  )
}

export default AdminCategories