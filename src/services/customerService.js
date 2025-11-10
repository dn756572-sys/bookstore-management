import { api } from './api'

export const customerService = {
  getAllCustomers: async (params = {}) => {
    try {
      const response = await api.get('/customers', { params })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching customers:', error)
      return []
    }
  },

  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw error
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData)
      return response.data
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  },

  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  },

  getCustomerOrders: async (id) => {
    try {
      const response = await api.get(`/customers/${id}/orders`)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      return []
    }
  }
}