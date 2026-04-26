import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import api from '../../api/axiosConfig'

type CurrentUserResponse = {
  username: string
  email: string
  isActive: boolean
  createdAt: string
}

function Profile() {
  const [authUser, setAuthUser] = useState<CurrentUserResponse | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get<CurrentUserResponse>('/auth/me')
        setAuthUser(response.data)
      } catch {
        setAuthUser(null)
      } finally {
        setLoadingUser(false)
      }
    }

    fetchCurrentUser()
  }, [])

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')
    setPasswordLoading(true)

    try {
      const response = await api.post('/auth/change-password', {
        username: authUser?.username,
        currentPassword,
        newPassword,
      })

      setPasswordMessage(response.data?.message || 'Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error: any) {
      setPasswordError(
        error?.response?.data?.message || 'Failed to change password.',
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loadingUser) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div className="border border-white p-5">
        <p className="mb-2">
          <span className="font-medium">Username:</span> {authUser?.username || '-'}
        </p>
        <p className="mb-2">
          <span className="font-medium">Email:</span> {authUser?.email || '-'}
        </p>
        <p>
          <span className="font-medium">Active:</span>{' '}
          {authUser?.isActive ? 'Yes' : 'No'}
        </p>
      </div>

      <section className="border border-white p-5 max-w-xl">
        <h3 className="mb-4 text-lg font-medium">Change Password</h3>

        <form className="space-y-3" onSubmit={handlePasswordChange}>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full border border-white bg-black px-4 py-3 text-white"
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full border border-white bg-black px-4 py-3 text-white"
          />

          {passwordMessage && (
            <div className="border border-white px-4 py-3 text-sm">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="border border-white px-4 py-3 text-sm">
              {passwordError}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading || !authUser}
            className="border border-white px-4 py-3 hover:bg-white hover:text-black disabled:opacity-60"
          >
            {passwordLoading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default Profile