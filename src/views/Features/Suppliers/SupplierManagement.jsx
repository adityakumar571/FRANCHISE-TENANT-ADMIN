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
  const PER = 10
  const debounceRef = useRef()

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PER.toString(),
        search: search,
        status: statusFilter
      })
      
      const res = await getRequest(`/franchise/suppliers?${params}`)
      const d = res.data?.data
      
      setSuppliers(d?.suppliers || [])
      setTotal(d?.total || 0)
      setTotalPages(d?.totalPages || 1)
      if (d?.kpi) setKpi(d.kpi)
    } catch (error) {
      message.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => { 
    fetchSuppliers() 
  }, [fetchSuppliers])

  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchSuppliers, 400)
  }

  const handleStatusChange = async (supplierId, newStatus) => {
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
  }

  const handleAddSupplier = async (values) => {
    try {
      await postRequest({
        url: '/franchise/suppliers',
        cred: values
      })
      
      message.success('Supplier created successfully')
      setAddModalVisible(false)
      addForm.resetFields()
      fetchSuppliers()
    } catch (error) {
      message.error('Failed to create supplier')
    }
  }

  const handleViewDetails = async (supplierId) => {
    try {
      const response = await getRequest(`/franchise/suppliers/${supplierId}`)
      if (response.data.success) {
        setSelectedSupplier(response.data.data)
        setDrawerVisible(true)
      }
    } catch (error) {
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
              name="name"
              label="Supplier Name"
              rules={[{ required: true, message: 'Please input supplier name!' }]}
            >
              <Input placeholder="Enter supplier name" />
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
              name="phone"
              label="Phone"
              rules={[{ required: true, message: 'Please input phone!' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              name="gstNo"
              label="GST Number"
            >
              <Input placeholder="Enter GST number" />
            </Form.Item>

            <Form.Item
              name="dlNo"
              label="DL Number"
            >
              <Input placeholder="Enter DL number" />
            </Form.Item>
          </div>

          {/* Address Section */}
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Address Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please input address!' }]}
              >
                <Input.TextArea rows={2} placeholder="Enter full address" />
              </Form.Item>

              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please input city!' }]}
              >
                <Input placeholder="Enter city" />
              </Form.Item>

              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please input state!' }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>

              <Form.Item
                name="pincode"
                label="Pincode"
                rules={[{ required: true, message: 'Please input pincode!' }]}
              >
                <Input placeholder="Enter pincode" />
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
    </div>
  )
}