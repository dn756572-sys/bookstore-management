import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, USER_ROLE_LABELS } from './constants'

/**
 * Format price to Vietnamese currency
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }
  
  return new Date(date).toLocaleDateString('vi-VN', { ...defaultOptions, ...options })
}

/**
 * Format datetime to Vietnamese format
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get display label for order status
 */
export const getOrderStatusLabel = (status) => {
  return ORDER_STATUS_LABELS[status] || status
}

/**
 * Get display label for payment method
 */
export const getPaymentMethodLabel = (method) => {
  return PAYMENT_METHOD_LABELS[method] || method
}

/**
 * Get display label for user role
 */
export const getUserRoleLabel = (role) => {
  return USER_ROLE_LABELS[role] || role
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Generate random color for avatars
 */
export const generateRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if user has required role
 */
export const hasRole = (user, requiredRole) => {
  if (!user || !user.vaiTro) return false
  return user.vaiTro === requiredRole
}

/**
 * Check if user has any of the required roles
 */
export const hasAnyRole = (user, requiredRoles = []) => {
  if (!user || !user.vaiTro) return false
  return requiredRoles.includes(user.vaiTro)
}

/**
 * Calculate total for order items
 */
export const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => total + (item.donGia * item.soLuong), 0)
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)(\d{9,10})$/
  return phoneRegex.test(phone)
}

/**
 * Get initial from name
 */
export const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}