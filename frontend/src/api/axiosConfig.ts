import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('authUser')

  if (storedUser) {
    const authUser = JSON.parse(storedUser)
    if (authUser?.token) {
      config.headers.Authorization = `Bearer ${authUser.token}`
    }
  }

  return config
})

export default api