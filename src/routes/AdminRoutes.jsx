import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/*" element={
        <ProtectedRoute requireAdmin={true}>
          {/* Admin layout and routes will be handled by AppRoutes */}
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AdminRoutes