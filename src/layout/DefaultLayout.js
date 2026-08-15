import React, { useEffect, useState, useContext } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components'
import { getRequest } from '../Helpers'
import { useNavigate } from 'react-router-dom'
import { deleteCookie } from '../Hooks/cookie'
import { AppContext } from '../Context/AppContext'
import { useRoles } from '../Context/AuthContext'
import Cookies from 'js-cookie'

const DefaultLayout = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const { setRole } = useRoles()
  const { setUser } = useContext(AppContext)

  useEffect(() => {
    // 🔐 No token → redirect to login immediately
    const token = Cookies.get('multitenant')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const savedUser = localStorage.getItem('userId')
    const parsedUser = savedUser ? JSON.parse(savedUser) : null
    if (parsedUser) setUserData(parsedUser)

    getRequest(`mainUser/getProfile`)
      .then((res) => {
        const profile = res?.data?.data?.user
        setUser(profile)
        setRole(profile?.role)
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          deleteCookie('multitenant')
          localStorage.removeItem('userId')
          navigate('/login', { replace: true })
        } else {
          console.error('API Error:', error)
        }
      })
  }, [navigate, setUser, setRole])

  return (
    <div>
      <AppSidebar userData={userData} />

      <div
        className="wrapper d-flex flex-column min-vh-100"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <AppHeader userData={userData} />

        <div className="body flex-grow-1">
          <AppContent userData={userData} />
        </div>

        <AppFooter userData={userData} />
      </div>
    </div>
  )
}

export default DefaultLayout
