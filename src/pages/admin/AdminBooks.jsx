import React from 'react'
import AdminLayout from '../../components/common/AdminLayout'
import BookList from '../../components/books/BookList'

const AdminBooks = () => {
  return (
    <AdminLayout>
      <div className="admin-books">
        <BookList isAdmin={true} />
      </div>
    </AdminLayout>
  )
}

export default AdminBooks