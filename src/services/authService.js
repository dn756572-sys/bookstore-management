import { api } from './api'

export const authService = {
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login with:', credentials)
      const response = await api.post('/auth/login', credentials)
      console.log('✅ Login response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Login service error:', error)
      throw error
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 Attempting registration with:', userData)
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('❌ Register service error:', error)
      throw error
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error) {
      console.error('❌ Get profile error:', error)
      throw error
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData)
      return response.data
    } catch (error) {
      console.error('❌ Change password error:', error)
      throw error
    }
  }
}