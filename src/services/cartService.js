import { api } from './api'

export const cartService = {
  getCart: async () => {
    try {
      const response = await api.get('/cart')
      return response.data
    } catch (error) {
      console.error('Get cart error:', error)
      // Trả về cart rỗng thay vì mock data
      return {
        data: {
          items: [],
          summary: {
            totalItems: 0,
            totalAmount: 0
          }
        }
      }
    }
  },

  addToCart: async (MaSach, SoLuong = 1) => {
    try {
      const response = await api.post('/cart/add', { MaSach, SoLuong })
      return response.data
    } catch (error) {
      console.error('Add to cart error:', error)
      throw error
    }
  },

  updateCartItem: async (MaSach, SoLuong) => {
    try {
      const response = await api.put(`/cart/update/${MaSach}`, { SoLuong })
      return response.data
    } catch (error) {
      console.error('Update cart error:', error)
      throw error
    }
  },

  removeFromCart: async (MaSach) => {
    try {
      const response = await api.delete(`/cart/remove/${MaSach}`)
      return response.data
    } catch (error) {
      console.error('Remove from cart error:', error)
      throw error
    }
  },

  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear')
      return response.data
    } catch (error) {
      console.error('Clear cart error:', error)
      throw error
    }
  },

  getCartCount: async () => {
    try {
      const response = await api.get('/cart/count')
      return response.data
    } catch (error) {
      console.error('Get cart count error:', error)
      return { data: { count: 0, totalItems: 0 } }
    }
  }
}