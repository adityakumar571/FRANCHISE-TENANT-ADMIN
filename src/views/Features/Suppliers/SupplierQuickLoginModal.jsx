import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import {
  LogIn, Loader2, ExternalLink,
  AlertTriangle, RefreshCw,
  Terminal, Truck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { postRequest } from '../../../Helpers'

const API_BASE = import.meta.env.VITE_API_BASE_URL

const getSupplierPortalUrl = () => {
  // You can configure supplier portal URL in environment
  return import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'http://localhost:5180'
}

/* ════════════════════════════════════════════════
   SUPPLIER QUICK LOGIN MODAL
════════════════════════════════════════════════ */
const SupplierQuickLoginModal = ({ open, onClose, supplier }) => {
  const [step, setStep] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)
  const [loginToken, setLoginToken] = useState(null)
  const [supplierCredentials, setSupplierCredentials] = useState(null)

  useEffect(() => {
    if (open && supplier?._id) {
      setStep('confirm')
      setErrorMsg('')
      setDebugInfo(null)
      setShowDebug(false)
      setLoginToken(null)
      setSupplierCredentials(null)
    }
  }, [open, supplier?._id])

  const handleLoginConfirm = () => {
    setStep('logging-in')
    handleLoginAs()
  }

  const handleLoginAs = async () => {
    try {
      const res = await postRequest({
        url: `franchise/suppliers/${supplier._id}/login-as`,
        cred: {}
      })
      
      console.log('Login API Response:', res.data)
      
      const token = res?.data?.data?.token
      const supplierData = res?.data?.data?.supplier
      
      if (!token) {
        console.error('Token not found in response:', res.data)
        throw new Error('Login succeeded but no token returned')
      }
      
      // Store token and credentials for display
      setLoginToken(token)
      setSupplierCredentials({
        email: supplierData?.email || supplier.email,
        supplierCode: supplierData?.supplierCode || supplier.supplierCode || supplier.id,
        name: supplierData?.name || supplier.name,
        // Password is the same as supplierCode for auto-login
        password: supplierData?.supplierCode || supplier.supplierCode || supplier.id
      })
      setStep('credentials')
    } catch (err) {
      console.error('Login error:', err)
      const msg = err?.response?.data?.message || err?.message || 'Login failed.'
      setErrorMsg(msg)
      setDebugInfo({
        type: 'login',
        tried: [`POST ${API_BASE}franchise/suppliers/${supplier._id}/login-as`],
        error: msg,
        response: err?.response?.data
      })
      setStep('error')
    }
  }

  const handleProceedToPortal = () => {
    if (loginToken) {
      openSupplierPortal(loginToken)
    } else {
      setErrorMsg('Login token not found')
      setStep('error')
    }
  }

  const openSupplierPortal = (token) => {
    setStep('opening')
    toast.success(`Opening ${supplier.name} portal…`)
    const portalUrl = getSupplierPortalUrl()
    const targetUrl = `${portalUrl}/auto-login?token=${encodeURIComponent(token)}&supplierId=${encodeURIComponent(supplier._id)}`
    setTimeout(() => {
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
      setStep('done')
      setTimeout(handleClose, 1500)
    }, 600)
  }

  const handleClose = () => {
    setStep('idle')
    setErrorMsg('')
    setDebugInfo(null)
    setShowDebug(false)
    setLoginToken(null)
    setSupplierCredentials(null)
    onClose()
  }

  if (!supplier) return null

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      destroyOnClose
      styles={{
        content: { borderRadius: 20, padding: 0, overflow: 'hidden', fontFamily: 'Inter, sans-serif' },
        header: { padding: '20px 24px 0 24px', marginBottom: 0, background: 'transparent' },
        body: { padding: '16px 24px 24px 24px' },
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Inter, sans-serif' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <LogIn size={18} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Quick Login to Supplier Portal
            </p>
            <p style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8', margin: 0, marginTop: 2 }}>
              Direct access to supplier dashboard
            </p>
          </div>
        </div>
      }
    >
      <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Supplier card ── */}
        <div style={{
          background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 16,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: '#fff',
            border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Truck size={20} color="#d97706" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {supplier.name}
            </p>
            <p style={{ fontSize: 11, fontWeight: 400, color: '#92400e', margin: 0, marginTop: 3, fontFamily: 'monospace' }}>
              {supplier.id || supplier.supplierCode}
            </p>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, flexShrink: 0,
            ...(supplier.status === 'Active'
              ? { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
              : { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' })
          }}>
            {supplier.status}
          </span>
        </div>

        {/* ── CONFIRM LOGIN ── */}
        {step === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: 0 }}>
                Generate login credentials for:
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0c3b73', margin: 0, marginTop: 6 }}>
                {supplier.name}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 4 }}>
                {supplier.email}
              </p>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, textAlign: 'center' }}>
              Click below to generate temporary login credentials
            </p>
          </div>
        )}

        {/* ── SHOW CREDENTIALS ── */}
        {step === 'credentials' && supplierCredentials && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 0' }}>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#9a3412', margin: 0, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔐 Supplier Login Credentials
              </p>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#78350f', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Supplier ID:
                </label>
                <div style={{ 
                  background: '#fff', 
                  padding: '10px 14px', 
                  borderRadius: 8, 
                  border: '1px solid #fdba74',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0c3b73',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{supplierCredentials.supplierCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(supplierCredentials.supplierCode)
                      toast.success('Supplier ID copied!')
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#d97706',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 4,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#78350f', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Email / Username:
                </label>
                <div style={{ 
                  background: '#fff', 
                  padding: '10px 14px', 
                  borderRadius: 8, 
                  border: '1px solid #fdba74',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0c3b73',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{supplierCredentials.email}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(supplierCredentials.email)
                      toast.success('Email copied!')
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#d97706',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 4,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#78350f', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Password:
                </label>
                <div style={{ 
                  background: '#fff', 
                  padding: '10px 14px', 
                  borderRadius: 8, 
                  border: '1px solid #fdba74',
                  fontFamily: 'monospace',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#dc2626',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{supplierCredentials.password || supplierCredentials.supplierCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(supplierCredentials.password || supplierCredentials.supplierCode)
                      toast.success('Password copied!')
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#d97706',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 4,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
                💡 <strong>Login Instructions:</strong><br/>
                • Use Supplier ID or Email as username<br/>
                • Password is the same as Supplier ID<br/>
                • Change password after first login for security
              </p>
            </div>

            <p style={{ fontSize: 12, color: '#64748b', margin: 0, textAlign: 'center' }}>
              Portal URL: <strong style={{ color: '#0c3b73' }}>{getSupplierPortalUrl()}</strong>
            </p>
          </div>
        )}

        {/* ── LOGGING IN ── */}
        {step === 'logging-in' && (
          <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <Loader2 size={26} className="text-[#d97706] animate-spin" />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>
              Generating credentials for {supplier.name}…
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Please wait</p>
          </div>
        )}

        {/* ── OPENING PORTAL ── */}
        {step === 'opening' && (
          <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <Loader2 size={26} className="text-[#d97706] animate-spin" />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>
              Opening supplier portal…
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>New tab will open shortly</p>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 99, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ExternalLink size={24} color="#d97706" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>
              Opening {supplier.name} portal in new tab…
            </p>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10 }}>
              <AlertTriangle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#be123c', margin: 0 }}>Login Failed</p>
                <p style={{ fontSize: 12, color: '#e11d48', margin: 0, marginTop: 4, whiteSpace: 'pre-wrap' }}>{errorMsg}</p>
              </div>
            </div>
            {debugInfo && (
              <div>
                <button
                  onClick={() => setShowDebug(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Terminal size={11} />
                  {showDebug ? 'Hide' : 'Show'} debug info
                </button>
                {showDebug && (
                  <div style={{ marginTop: 8, background: '#0f172a', borderRadius: 10, padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: '#4ade80', overflowX: 'auto' }}>
                    {debugInfo.tried?.map((line, i) => <p key={i} style={{ margin: 0 }}>tried: {line}</p>)}
                    <p style={{ margin: 0, color: '#f87171' }}>error: {debugInfo.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER BUTTONS ── */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 4, borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              border: '1.5px solid #e2e8f0', borderRadius: 12, color: '#475569',
              background: 'white', cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            Cancel
          </button>

          {step === 'confirm' && (
            <button
              onClick={handleLoginConfirm}
              style={{
                flex: 2, padding: '11px 0', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                border: 'none', borderRadius: 12, color: 'white',
                background: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                letterSpacing: '-0.01em', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#b45309'}
              onMouseLeave={e => e.currentTarget.style.background = '#d97706'}
            >
              <LogIn size={15} />
              Generate Credentials
            </button>
          )}

          {step === 'credentials' && (
            <button
              onClick={handleProceedToPortal}
              style={{
                flex: 2, padding: '11px 0', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                border: 'none', borderRadius: 12, color: 'white',
                background: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                letterSpacing: '-0.01em', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
              onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
            >
              <ExternalLink size={15} />
              Open Supplier Portal
            </button>
          )}

          {(step === 'logging-in' || step === 'opening' || step === 'done') && (
            <button
              disabled
              style={{
                flex: 2, padding: '11px 0', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                border: 'none', borderRadius: 12, color: 'white',
                background: '#d97706', opacity: 0.6, cursor: 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <Loader2 size={14} className="animate-spin" /> 
              {step === 'logging-in' ? 'Generating…' : step === 'opening' ? 'Opening…' : 'Done'}
            </button>
          )}

          {step === 'error' && (
            <button
              onClick={() => { setErrorMsg(''); setDebugInfo(null); setShowDebug(false); setStep('confirm') }}
              style={{
                flex: 2, padding: '11px 0', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                border: 'none', borderRadius: 12, color: 'white',
                background: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#b45309'}
              onMouseLeave={e => e.currentTarget.style.background = '#d97706'}
            >
              <RefreshCw size={14} /> Retry
            </button>
          )}
        </div>

      </div>
    </Modal>
  )
}

export default SupplierQuickLoginModal
