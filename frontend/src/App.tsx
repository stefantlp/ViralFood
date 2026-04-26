import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/admin/Layout'
import Login from './pages/admin/Login'
import Profile from './pages/admin/Profile'
import Reservations from './pages/admin/Reservation'
import Orders from './pages/admin/Order'
import Menu from './pages/admin/Menu'

function App() {
  const authUser = localStorage.getItem('authUser')
  const isAuthenticated = !!authUser

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/admin/profile" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/admin"
        element={
          isAuthenticated ? (
            <Layout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/admin/profile" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<Menu />} />
      </Route>

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/admin/profile" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/admin/profile" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App