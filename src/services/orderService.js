import { api } from './api'

export const orderService = {
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      const response = await api.put(`/orders/${id}`, orderData)
      return response.data
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  },

  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching my orders:', error)
      return []
    }
  }
}