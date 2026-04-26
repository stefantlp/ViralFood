import { useEffect, useState } from 'react'
import api from '../../../api/axiosConfig'

type CurrentUserResponse = {
  username: string
  email: string
  isActive: boolean
  createdAt: string
}

function Topbar() {
  const [username, setUsername] = useState('Admin')

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get<CurrentUserResponse>('/auth/me')
        setUsername(response.data.username)
      } catch {
        setUsername('Admin')
      }
    }

    fetchCurrentUser()
  }, [])

  return (
    <header className="border-b border-white px-6 py-4">
      <div className="flex items-center justify-end">
        <div className="text-lg font-semibold">{username}</div>
      </div>
    </header>
  )
}

export default Topbar