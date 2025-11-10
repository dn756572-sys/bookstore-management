import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Customer Pages
import Home from '../pages/customer/Home'
import BooksPage from '../pages/customer/BooksPage'
import BookDetailPage from '../pages/customer/BookDetailPage'
import CartPage from '../pages/customer/CartPage'
import ProfilePage from '../pages/customer/ProfilePage'
import OrderHistory from '../pages/customer/OrderHistory'
import Checkout from '../pages/customer/Checkout'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminBooks from '../pages/admin/AdminBooks'
import AdminCategories from '../pages/admin/AdminCategories'
import AdminCustomers from '../pages/admin/AdminCustomers'
import AdminEmployees from '../pages/admin/AdminEmployees'
import AdminOrders from '../pages/admin/AdminOrders'

// Admin Form Pages
import BookForm from '../components/books/BookForm'
import CategoryForm from '../components/categories/CategoryForm'
import EmployeeForm from '../components/employees/EmployeeForm'
import CustomerDetail from '../components/customers/CustomerDetail'
import EmployeeDetail from '../components/employees/EmployeeDetail'
import OrderDetail from '../components/orders/OrderDetail'

const AppRoutes = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth()

  if (loading) {
    return <LoadingSpinner text="Đang tải..." />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:id" element={<BookDetailPage />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

      {/* Protected Customer Routes */}
      <Route path="/cart" element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <OrderHistory />
        </ProtectedRoute>
      } />
      <Route path="/orders/:id" element={
        <ProtectedRoute>
          <OrderDetail />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/books" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminBooks />
        </ProtectedRoute>
      } />
      <Route path="/admin/books/new" element={
        <ProtectedRoute requireAdmin={true}>
          <BookForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/books/edit/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <BookForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminCategories />
        </ProtectedRoute>
      } />
      <Route path="/admin/categories/new" element={
        <ProtectedRoute requireAdmin={true}>
          <CategoryForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/categories/edit/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <CategoryForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminCustomers />
        </ProtectedRoute>
      } />
      <Route path="/admin/customers/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <CustomerDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminEmployees />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees/new" element={
        <ProtectedRoute requireAdmin={true}>
          <EmployeeForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees/edit/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <EmployeeForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <EmployeeDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminOrders />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <OrderDetail isAdmin={true} />
        </ProtectedRoute>
      } />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes