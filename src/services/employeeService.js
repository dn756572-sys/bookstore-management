import { api } from './api'

export const employeeService = {
  getAllEmployees: async () => {
    try {
      const response = await api.get('/employees')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching employees:', error)
      return []
    }
  },

  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching employee:', error)
      throw error
    }
  },

  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employees', employeeData)
      return response.data
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  },

  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData)
      return response.data
    } catch (error) {
      console.error('Error updating employee:', error)
      throw error
    }
  },

  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  }
}