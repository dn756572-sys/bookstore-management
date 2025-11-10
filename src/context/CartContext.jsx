import React, { createContext, useState, useContext, useEffect } from 'react'
import { cartService } from '../services/cartService'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const loadCart = async () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      setCartItems([])
      return
    }

    try {
      setLoading(true)
      const response = await cartService.getCart()
      // Sửa: Lấy items từ response.data.data.items
      const items = response.data?.data?.items || []
      setCartItems(Array.isArray(items) ? items : [])
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [isAuthenticated, user])

  const addToCart = async (MaSach, quantity = 1) => {
    if (!isAuthenticated || user?.role !== 'customer') {
      return { 
        success: false, 
        message: 'Vui lòng đăng nhập để thêm vào giỏ hàng' 
      }
    }

    try {
      await cartService.addToCart(MaSach, quantity)
      await loadCart() // Reload cart after change
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Thêm vào giỏ hàng thất bại'
      return { success: false, message }
    }
  }

  const updateCartItem = async (MaSach, quantity) => {
    if (!isAuthenticated || user?.role !== 'customer') {
      return { 
        success: false, 
        message: 'Vui lòng đăng nhập để cập nhật giỏ hàng' 
      }
    }

    try {
      await cartService.updateCartItem(MaSach, quantity)
      await loadCart() // Reload cart after change
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật giỏ hàng thất bại'
      return { success: false, message }
    }
  }

  const removeFromCart = async (MaSach) => {
    if (!isAuthenticated || user?.role !== 'customer') {
      return { 
        success: false, 
        message: 'Vui lòng đăng nhập để xóa khỏi giỏ hàng' 
      }
    }

    try {
      await cartService.removeFromCart(MaSach)
      await loadCart() // Reload cart after change
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa khỏi giỏ hàng thất bại'
      return { success: false, message }
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      return { 
        success: false, 
        message: 'Vui lòng đăng nhập để xóa giỏ hàng' 
      }
    }

    try {
      await cartService.clearCart()
      setCartItems([])
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa giỏ hàng thất bại'
      return { success: false, message }
    }
  }

  const getCartTotal = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0
    return cartItems.reduce((total, item) => {
      const itemTotal = item.ThanhTien || 0
      return total + parseFloat(itemTotal)
    }, 0)
  }

  const getCartCount = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0
    return cartItems.reduce((count, item) => count + (item.SoLuong || 0), 0)
  }

  const value = {
    cartItems: Array.isArray(cartItems) ? cartItems : [],
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    reloadCart: loadCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}