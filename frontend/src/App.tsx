import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/admin/Layout'
import Login from './pages/admin/Login'
import Profile from './pages/admin/Profile'
import Reservations from './pages/admin/Reservation'
import Orders from './pages/admin/Order'
import Menu from './pages/admin/Menu'
import Home from './pages/client/Home'
import ClientReservations from './pages/client/Reservations'
import ClientOrderPage from './pages/client/OrderPage'
import Contact from './pages/client/Contact'

function App() {
    const authUser = localStorage.getItem('authUser')
    const isAuthenticated = !!authUser

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reservations" element={<ClientReservations />} />
            <Route path="/order" element={<ClientOrderPage />} />
            <Route path="/contact" element={<Contact />} />

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
                path="*"
                element={
                    isAuthenticated ? (
                        <Navigate to="/admin/profile" replace />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />
        </Routes>
    )
}

export default App
