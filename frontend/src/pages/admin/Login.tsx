import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import type { AuthUser } from '../../types/auth'

type LoginResponse = {
  message: string
  username: string
  email: string
  token: string
}

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const authUser = localStorage.getItem('authUser')

    if (authUser) {
      navigate('/admin/profile', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        username,
        password,
      })

      const authUser: AuthUser = {
        username: response.data.username,
        email: response.data.email,
        token: response.data.token,
      }

      localStorage.setItem('authUser', JSON.stringify(authUser))
      window.location.replace('/admin/profile')
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Login failed. Please try again.'

      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white p-8">
        <h1 className="mb-2 text-3xl font-semibold">Admin Login</h1>
        <p className="mb-8 text-sm text-zinc-300">
          Sign in to access the admin area.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-white bg-black px-4 py-3 text-white outline-none"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white bg-black px-4 py-3 text-white outline-none"
              autoComplete="current-password"
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-white px-4 py-3 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl border border-white px-4 py-3 hover:bg-white hover:text-black disabled:opacity-60"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login