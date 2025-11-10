import { api } from './api'

export const paymentService = {
  createPayment: async (orderId, paymentData) => {
    const response = await api.post('/payments', { maDH: orderId, ...paymentData })
    return response.data
  },

  getPaymentByOrderId: async (orderId) => {
    const response = await api.get(`/payments/order/${orderId}`)
    return response.data
  },

  updatePaymentStatus: async (paymentId, status) => {
    const response = await api.patch(`/payments/${paymentId}/status`, { status })
    return response.data
  }
}