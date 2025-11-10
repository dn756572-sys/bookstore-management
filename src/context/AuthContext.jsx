import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false) // Thêm state cho auth loading
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0)

  const loadProfile = async () => {
    // Giới hạn số lần thử load profile
    if (profileLoadAttempts > 3) {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await authService.getProfile()
      // SỬA: Lấy user từ response.data.user
      setUser(response.data.user)
      setProfileLoadAttempts(0)
    } catch (error) {
      console.error('Lỗi tải profile:', error)
      
      // Chỉ clear token nếu lỗi 401 (unauthorized)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        setUser(null)
      }
      
      setProfileLoadAttempts(prev => prev + 1)
      
      // Retry sau 2 giây nếu là lỗi 429
      if (error.response?.status === 429 && profileLoadAttempts < 2) {
        setTimeout(loadProfile, 2000)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const login = async (credentials) => {
    setAuthLoading(true)
    try {
      const response = await authService.login(credentials)
      // SỬA QUAN TRỌNG: Lấy từ response.data
      const { data } = response
      const { token, user } = data
      
      localStorage.setItem('token', token)
      setUser(user)
      return { success: true, user }
    } catch (error) {
      let message = 'Đăng nhập thất bại'
      
      if (error.response?.status === 429) {
        message = 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút'
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      }
      
      return { success: false, message }
    } finally {
      setAuthLoading(false)
    }
  }

  const register = async (userData) => {
    setAuthLoading(true)
    try {
      const response = await authService.register(userData)
      // SỬA: Lấy từ response.data
      const { data } = response
      const { token, user } = data
      
      localStorage.setItem('token', token)
      setUser(user)
      return { success: true, user }
    } catch (error) {
      let message = 'Đăng ký thất bại'
      
      if (error.response?.status === 429) {
        message = 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút'
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      }
      
      return { success: false, message }
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    authLoading, // Thêm authLoading riêng
    isAuthenticated: !!user,
    isAdmin: user?.vaiTro === 'Admin',
    isEmployee: user?.vaiTro === 'NhanVien' || user?.vaiTro === 'Admin',
    isCustomer: user?.role === 'customer' // Thêm check customer
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}