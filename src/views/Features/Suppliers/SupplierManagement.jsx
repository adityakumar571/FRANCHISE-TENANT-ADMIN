import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Search, Plus, Eye, Edit2, ChevronLeft, ChevronRight, Download, Users, UserCheck, UserX, IndianRupee, LogIn } from 'lucide-react'
import { Card, Button, Input, Select, Space, Tag, Modal, Drawer, Tooltip, message, Form, Table } from 'antd'
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { getRequest, putRequest, postRequest, deleteRequest } from '../../../Helpers'
import moment from 'moment'
import SupplierQuickLoginModal from './SupplierQuickLoginModal'

const API_BASE = import.meta.env.VITE_API_BASE_URL

const getSupplierPortalUrl = () => {
  return import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'http://localhost:5180'
}

const { Option } = Select
const { Search: AntSearch } = Input

const Th = ({ c }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

const PageHeader = ({ icon: Icon, title, subtitle, color, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, background: '#fff', padding: '20px 24px', borderRadius: 12, border: '1px solid #e5e7eb' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '2px 0 0' }}>{subtitle}</p>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>{children}</div>
  </div>
)

export default function SupplierManagement() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [kpi, setKpi] = useState({ total: 0, active: 0, inactive: 0, totalPayable: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [addForm] = Form.useForm()
  const [loginModalVisible, setLoginModalVisible] = useState(false)
  const [selectedSupplierForLogin, setSelectedSupplierForLogin] = useState(null)
  const [credentialsModal, setCredentialsModal] = useState({ visible: false, email: '', password: '' })
  const PER = 10
  const debounceRef = useRef()

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PER.toString(),
      })
      
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      
      console.log('🔍 Fetching suppliers with params:', params.toString())
      
      // Use global suppliers endpoint (read-only for franchises)
      const res = await getRequest(`franchise-suppliers/suppliers?${params}`)
      console.log('📡 Supplier response:', res)
      
      // Handle different response structures
      const responseData = res?.data?.data || res?.data || res
      let suppliersList = Array.isArray(responseData) ? responseData : 
                          responseData?.suppliers || []
      
      // Normalize data to match frontend expectations
      suppliersList = suppliersList.map((supplier, index) => ({
        ...supplier,
        id: supplier._id?.slice(-8) || `SUP${index + 1}`, // Generate supplier code
        name: supplier.companyName || 'N/A',
        city: supplier.address?.city || 'N/A',
        state: supplier.address?.state || 'N/A',
        outstanding: supplier.outstanding || 0,
        status: supplier.status || 'Active'
      }))
      
      console.log('✅ Suppliers normalized:', suppliersList)
      setSuppliers(suppliersList)
      setTotal(responseData?.total || suppliersList.length)
      setTotalPages(responseData?.totalPages || Math.ceil(suppliersList.length / PER))
      
      // Calculate KPIs from loaded data
      const activeCount = suppliersList.filter(s => s.status === 'Active').length
      const inactiveCount = suppliersList.filter(s => s.status === 'Inactive' || s.status === 'Suspended').length
      const totalOutstanding = suppliersList.reduce((sum, s) => sum + (s.outstanding || 0), 0)
      
      setKpi({
        total: suppliersList.length,
        active: activeCount,
        inactive: inactiveCount,
        totalPayable: totalOutstanding
      })
    } catch (error) {
      console.error('❌ Supplier fetch error:', error)
      console.error('Error response:', error?.response?.data)
      message.error(error?.response?.data?.message || 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => { 
    // Test auth first
    testAuth()
    fetchSuppliers() 
  }, [fetchSuppliers])

  const testAuth = async () => {
    try {
      console.log('🧪 Testing auth...')
      const res = await getRequest('franchise-suppliers/test-auth')
      console.log('✅ Auth test response:', res)
    } catch (error) {
      console.error('❌ Auth test failed:', error)
      console.error('Error details:', error?.response?.data)
    }
  }

  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchSuppliers, 400)
  }

  const handleStatusChange = async (supplierId, newStatus) => {
    message.info('Supplier status can only be changed by Super Admin.')
    return
    
    /* OLD CODE - franchises cannot modify suppliers
    try {
      const status = newStatus === 'Active'
      await putRequest({
        url: `/franchise/suppliers/${supplierId}`,
        cred: { isActive: status }
      })
      
      message.success(`Supplier ${newStatus.toLowerCase()} successfully`)
      fetchSuppliers()
    } catch (error) {
      message.error('Failed to update supplier status')
    }
    */
  }

  const handleAddSupplier = async (values) => {
    try {
      console.log('📤 Form values received:', values)
      
      // Transform data to match backend expectations
      const payload = {
        companyName: values.companyName,
        contactPerson: values.contactPerson,
        email: values.email,
        password: values.password,
        phone: values.phone,
        businessType: values.businessType,
        address: {
          street: values.address?.street || '',
          city: values.address?.city || '',
          state: values.address?.state || '',
          pincode: values.address?.pincode || ''
        }
      }
      
      console.log('📤 Sending payload to backend:', JSON.stringify(payload, null, 2))
      
      // Call Super Admin API to create supplier
      const response = await postRequest({
        url: 'suppliers/admin/create',
        cred: payload
      })
      
      console.log('✅ Supplier created successfully:', response)
      
      // Close add modal
      setAddModalVisible(false)
      addForm.resetFields()
      
      // Show success message
      message.success('Supplier created! Copy credentials from alert.', 4)
      
      // Show browser alert with credentials (GUARANTEED TO WORK!)
      alert(`✅ SUPPLIER CREATED SUCCESSFULLY!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 Company: ${values.companyName}

📧 Email: ${values.email}

🔐 Password: ${values.password}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT:
• Copy and save these credentials NOW
• Email and password are needed for supplier login
• These won't be shown again

💡 TIP: Screenshot this alert!`)
      
      // Refresh supplier list
      fetchSuppliers()
    } catch (error) {
      console.error('❌ Create supplier error:', error)
      console.error('Error response:', error?.response?.data)
      
      // Show detailed error message
      const errorMsg = error?.response?.data?.data 
        ? JSON.stringify(error.response.data.data) 
        : error?.response?.data?.message || 'Failed to create supplier'
      
      message.error(errorMsg)
    }
  }

  const handleViewDetails = async (supplierId) => {
    try {
      // Use global suppliers endpoint for viewing details
      const response = await getRequest(`franchise-suppliers/suppliers/${supplierId}`)
      if (response.data.success !== false) {
        setSelectedSupplier(response.data.data || response.data)
        setDrawerVisible(true)
      }
    } catch (error) {
      console.error('View details error:', error)
      message.error('Failed to fetch supplier details')
    }
  }

  const handleQuickLogin = (supplier) => {
    setSelectedSupplierForLogin(supplier)
    setLoginModalVisible(true)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Truck} title="Supplier Management" subtitle="Manage medicine suppliers for all franchises" color="#d97706">
        <button
          onClick={() => {
            const rows = suppliers.map(s => `${s.id},${s.name},${s.phone},${s.email},${s.city},${s.outstanding},${s.status}`).join('\n')
            const csv = `Supplier Code,Name,Phone,Email,City,Outstanding,Status\n${rows}`
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='suppliers.csv'; a.click()
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
        <button onClick={() => setAddModalVisible(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#d97706', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> + Add Supplier
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Suppliers',    value: loading ? '...' : kpi.total,    icon: Users,        color: '#0c3b73', bg: '#e0e7ff' },
          { label: 'Active Suppliers',   value: loading ? '...' : kpi.active,   icon: UserCheck,    color: '#16a34a', bg: '#dcfce7' },
          { label: 'Inactive Suppliers', value: loading ? '...' : kpi.inactive, icon: UserX,        color: '#dc2626', bg: '#fee2e2' },
          { label: 'Total Payable',      value: loading ? '...' : `₹${(kpi.totalPayable/1000).toFixed(1)}K`, icon: IndianRupee, color: '#d97706', bg: '#fef3c7' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '2px 0 0' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by name, code, phone..."
            style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button
          onClick={() => {
            const rows = suppliers.map(s => `${s.id},${s.name},${s.phone},${s.email},${s.city},${s.outstanding},${s.status}`).join('\n')
            const csv = `Supplier Code,Name,Phone,Email,City,Outstanding,Status\n${rows}`
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='suppliers.csv'; a.click()
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <Download size={12} /> Export
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Supplier Code', 'Supplier Name', 'Phone', 'Email', 'City', 'Outstanding', 'Status', 'Action'].map(h => <Th key={h} c={h} />)}
            </tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : suppliers.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No suppliers found</td></tr>
                  : suppliers.map(s => (
                    <tr key={s._id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{s.id}</span></Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#d97706', fontSize: 13, flexShrink: 0 }}>
                            {s.name?.[0]}
                          </div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{s.name}</span>
                        </div>
                      </Td>
                      <Td style={{ color: '#6b7280' }}>{s.phone}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.email}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{s.city}</Td>
                      <Td style={{ fontWeight: 700, color: s.outstanding > 0 ? '#dc2626' : '#16a34a' }}>
                        ₹{Number(s.outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Td>
                      <Td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.status === 'Active' ? '#dcfce7' : '#fee2e2', color: s.status === 'Active' ? '#16a34a' : '#dc2626' }}>
                          {s.status}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => handleViewDetails(s._id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Eye size={11} /> View
                          </button>
                          <button
                            onClick={() => navigate(`/suppliers/${s._id}/edit`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <Edit2 size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleQuickLogin(s)}
                            style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <LogIn size={11} /> Login
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {suppliers.length} of {total} suppliers</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} style={{ background: n === page ? '#0c3b73' : 'none', border: `1px solid ${n === page ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: n === page ? '#fff' : '#374151', fontSize: 12 }}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', background: 'none' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer
        title="Supplier Details"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedSupplier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Basic Info */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Basic Information</p>
              </div>
              <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Supplier Name</label>
                  <div style={{ color: '#111827' }}>{selectedSupplier.name}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Supplier Code</label>
                  <div style={{ color: '#111827' }}>{selectedSupplier.supplierCode}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Contact Person</label>
                  <div style={{ color: '#111827' }}>{selectedSupplier.contactPerson}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Email</label>
                  <div style={{ color: '#111827' }}>{selectedSupplier.email}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Phone</label>
                  <div style={{ color: '#111827' }}>{selectedSupplier.phone}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Status</label>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: selectedSupplier.isActive ? '#dcfce7' : '#fee2e2', color: selectedSupplier.isActive ? '#16a34a' : '#dc2626' }}>
                    {selectedSupplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Address</p>
              </div>
              <div style={{ padding: '18px' }}>
                <div style={{ color: '#111827' }}>
                  {selectedSupplier.address}<br/>
                  {selectedSupplier.city}, {selectedSupplier.state}<br/>
                  {selectedSupplier.pincode}
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Business Details</p>
              </div>
              <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>GST Number</label>
                  <div style={{ color: '#111827' }}>{selectedSupplier.gstNo || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>DL Number</label>
                  <div style={{ color: '#111827' }}>{selectedSupplier.dlNo || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Rating</label>
                  <div style={{ color: '#111827' }}>{selectedSupplier.rating || 0}/5</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Verified</label>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: selectedSupplier.isVerified ? '#dcfce7' : '#fef3c7', color: selectedSupplier.isVerified ? '#16a34a' : '#d97706' }}>
                    {selectedSupplier.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Outstanding */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Financial Information</p>
              </div>
              <div style={{ padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>
                  ₹{selectedSupplier.outstandingBalance?.toLocaleString() || 0}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Outstanding Balance</div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#374151' }}>Timeline</p>
              </div>
              <div style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Created:</span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {moment(selectedSupplier.createdAt).format('DD MMM YYYY, hh:mm A')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Last Updated:</span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {moment(selectedSupplier.updatedAt).format('DD MMM YYYY, hh:mm A')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Supplier Modal */}
      <Modal
        title="Add New Supplier"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false)
          addForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddSupplier}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true, message: 'Please input company name!' }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>

            <Form.Item
              name="contactPerson"
              label="Contact Person"
              rules={[{ required: true, message: 'Please input contact person!' }]}
            >
              <Input placeholder="Enter contact person name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Please enter valid email!' }
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password placeholder="Enter password (min 6 chars)" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Please input phone!' },
                { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number!' }
              ]}
            >
              <Input placeholder="Enter 10-digit phone number" maxLength={10} />
            </Form.Item>

            <Form.Item
              name="businessType"
              label="Business Type"
              rules={[{ required: true, message: 'Please select business type!' }]}
            >
              <Select placeholder="Select business type">
                <Select.Option value="Manufacturer">Manufacturer</Select.Option>
                <Select.Option value="Distributor">Distributor</Select.Option>
                <Select.Option value="Retailer">Retailer</Select.Option>
                <Select.Option value="Wholesaler">Wholesaler</Select.Option>
                <Select.Option value="Service Provider">Service Provider</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="gstNo"
              label="GST Number (Optional)"
            >
              <Input placeholder="Enter GST number" />
            </Form.Item>

            <Form.Item
              name="dlNo"
              label="DL Number (Optional)"
            >
              <Input placeholder="Enter DL number" />
            </Form.Item>
          </div>

          {/* Address Section */}
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Address Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item
                name={['address', 'street']}
                label="Street Address"
                rules={[{ required: true, message: 'Please input street address!' }]}
              >
                <Input.TextArea rows={2} placeholder="Building, Street, Area" />
              </Form.Item>

              <Form.Item
                name={['address', 'city']}
                label="City"
                rules={[{ required: true, message: 'Please input city!' }]}
              >
                <Input placeholder="Enter city" />
              </Form.Item>

              <Form.Item
                name={['address', 'state']}
                label="State"
                rules={[{ required: true, message: 'Please input state!' }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>

              <Form.Item
                name={['address', 'pincode']}
                label="Pincode"
                rules={[
                  { required: true, message: 'Please input pincode!' },
                  { pattern: /^[0-9]{6}$/, message: 'Please enter valid 6-digit pincode!' }
                ]}
              >
                <Input placeholder="Enter 6-digit pincode" maxLength={6} />
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => {
                setAddModalVisible(false)
                addForm.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Supplier
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Quick Login Modal */}
      <SupplierQuickLoginModal
        open={loginModalVisible}
        onClose={() => {
          setLoginModalVisible(false)
          setSelectedSupplierForLogin(null)
        }}
        supplier={selectedSupplierForLogin}
      />

      {/* Supplier Credentials Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 20, color: '#16a34a' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Supplier Created Successfully!</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Save these credentials for supplier login</p>
            </div>
          </div>
        }
        open={credentialsModal.visible}
        onCancel={() => setCredentialsModal({ visible: false, email: '', password: '', companyName: '' })}
        footer={[
          <Button 
            key="copy" 
            onClick={() => {
              const text = `Supplier: ${credentialsModal.companyName}\nEmail: ${credentialsModal.email}\nPassword: ${credentialsModal.password}`
              navigator.clipboard.writeText(text)
              message.success('Credentials copied to clipboard!')
            }}
          >
            Copy Credentials
          </Button>,
          <Button 
            key="close" 
            type="primary"
            onClick={() => setCredentialsModal({ visible: false, email: '', password: '', companyName: '' })}
          >
            Done
          </Button>
        ]}
        width={500}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', fontWeight: 600 }}>
              ⚠️ Important: Save these credentials now! They won't be shown again.
            </p>
          </div>

          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Company Name</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>{credentialsModal.companyName}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Login Email</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#0c3b73', flex: 1 }}>{credentialsModal.email}</span>
                <Button 
                  size="small" 
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsModal.email)
                    message.success('Email copied!')
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Password</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#dc2626', flex: 1 }}>{credentialsModal.password}</span>
                <Button 
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsModal.password)
                    message.success('Password copied!')
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
              💡 How to Login as Supplier:
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#1e40af' }}>
              <li>Go to Supplier Portal</li>
              <li>Use the email and password shown above</li>
              <li>Click "Login" button to access supplier dashboard</li>
            </ol>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
              Note: Quick Login feature is under development. Use manual login for now.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}