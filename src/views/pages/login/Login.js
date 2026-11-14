/* eslint-disable prettier/prettier */
import './Login.css'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useCookie from '../../../Hooks/cookie'
import { FaEye, FaEyeSlash, FaBox, FaShieldAlt, FaRocket } from 'react-icons/fa'
import { AppContext } from '../../../Context/AppContext'
import { postRequest } from '../../../Helpers'

import logo from '../../../assets/PharmaNexus.png'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { setUser } = useContext(AppContext)
  const { setCookie } = useCookie()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({
      ...p,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.userId || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    postRequest({
      url: 'mainUser/login',
      cred: formData,
    })
      .then((res) => {
        setLoading(false)

        setCookie('multitenant', res?.data?.data?.token, 30)

        localStorage.setItem('userId', JSON.stringify(res?.data?.data?.user))

        setUser(res?.data?.data?.user)

        toast.success(res?.data?.message || 'Login Successful')

        navigate('/')
      })
      .catch((err) => {
        setLoading(false)

        toast.error(err?.response?.data?.message || 'Login failed')
      })
  }

  return (
    <div className="lp-page">
      {/* BACKGROUND */}
      <div className="lp-bg">
        <div className="lp-bg::before"></div>
        <div className="lp-bg__grid"></div>
        <div className="lp-bg__orb lp-bg__orb--1"></div>
        <div className="lp-bg__orb lp-bg__orb--2"></div>
        <div className="lp-bg__orb lp-bg__orb--3"></div>
      </div>

      {/* CONTAINER */}
      <div className="lp-container">
        {/* LEFT PANEL — Branding */}
        <div className="lp-left">
          <div className="lp-left__inner">
            <img src={logo} alt="PharmaNexus" className="lp-logo" />

            <div className="lp-badge">
              <span className="lp-badge__dot"></span>
              Pharmacy Management
            </div>

            <h1 className="lp-title">
              Manage Your <span className="lp-title__gold">Pharmacy</span> with Ease
            </h1>

            <p className="lp-desc">
              Control inventory, track sales, and optimize operations with our all-in-one platform
              for modern pharmacies.
            </p>

            <ul className="lp-features">
              <li className="lp-feature">
                <div className="lp-feature__icon">
                  <FaBox />
                </div>
                <div>
                  <div className="lp-feature__title">Inventory Management</div>
                  <div className="lp-feature__desc">
                    Real-time stock tracking and automated alerts
                  </div>
                </div>
              </li>

              <li className="lp-feature">
                <div className="lp-feature__icon">
                  <FaShieldAlt />
                </div>
                <div>
                  <div className="lp-feature__title">Secure & Compliant</div>
                  <div className="lp-feature__desc">Enterprise-grade security for your data</div>
                </div>
              </li>

              <li className="lp-feature">
                <div className="lp-feature__icon">
                  <FaRocket />
                </div>
                <div>
                  <div className="lp-feature__title">Fast & Reliable</div>
                  <div className="lp-feature__desc">
                    Lightning-quick operations and 99.9% uptime
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL — Login Form */}
        <div className="lp-right">
          <div className="lp-glass">
            {/* Logo inside glass (shown on small screens) */}
            <div className="lp-glass__logo-row">
              <img src={logo} alt="PharmaNexus" className="lp-glass__logo" />
            </div>

            <div className="lp-glass__title">Welcome Back</div>
            <div className="lp-glass__sub">Sign in to your franchise account</div>

            <form onSubmit={handleSubmit} className="lp-form">
              {/* USER ID */}
              <div className="lp-field">
                <label className="lp-label">User ID</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter your user ID"
                  required
                  className="lp-input"
                  disabled={loading}
                />
              </div>

              {/* PASSWORD */}
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="lp-input lp-input--pw"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button type="submit" className="lp-btn" disabled={loading}>
                {loading && <div className="lp-spinner"></div>}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="lp-glass__footer">© 2024 PharmaNexus. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
