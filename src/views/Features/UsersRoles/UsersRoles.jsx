/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Users, Plus, Edit, Trash2, Shield, Search } from 'lucide-react'
import { Switch, Tooltip, Modal, Form, Input, Select } from 'antd'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'
import AppTable, { Td } from '../../../components/AppTable'

const { Option } = Select

const ROLE_COLORS = {
  SuperAdmin: { bg: '#e8f1ff', color: '#1a73e8', border: '#c5d8ff' },
  Admin:      { bg: '#e8f8f0', color: '#16a34a', border: '#bbf0d0' },
  Manager:    { bg: '#fff4e6', color: '#ea7c1e', border: '#ffd9a8' },
  Billing:    { bg: '#f0ecff', color: '#7c3aed', border: '#d4c8ff' },
}

export default function UsersRoles() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage]       = useState(1)
  const [limit, setLimit]     = useState(10)
  const [total, setTotal]     = useState(0)
  const [search, setSearch]   = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form] = Form.useForm()
  const [saving, setSaving]   = useState(false)
  const [activeTab, setActiveTab] = useState('users') // 'users' | 'roles'

  const fetchUsers = () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    getRequest(`mainUser/getProfile?${params}`)
      .then(r => {
        const users = r?.data?.data?.users || []
        setData(users)
        setTotal(r?.data?.data?.total || users.length)
      })
      .catch(() => {
        // fallback — show empty
        setData([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, limit, search])

  const openAdd = () => { setEditItem(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (row) => { setEditItem(row); form.setFieldsValue({ name: row.name, email: row.email, role: row.role, phone: row.phone }); setModalOpen(true) }

  const handleSave = async () => {
    try {
      const vals = await form.validateFields()
      setSaving(true)
      if (editItem) {
        await putRequest({ url: `mainUser/${editItem._id}`, cred: vals })
        toast.success('User updated')
      } else {
        await postRequest({ url: 'mainUser/register', cred: vals })
        toast.success('User created')
      }
      setModalOpen(false)
      fetchUsers()
    } catch (e) {
      if (e?.errorFields) return
      toast.error(e?.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const COLS = [
    { key: 'sr',      label: 'Sr.',    align: 'center', width: 60  },
    { key: 'name',    label: 'Name',   align: 'left',   width: 200 },
    { key: 'email',   label: 'Email',  align: 'left',   width: 220 },
    { key: 'role',    label: 'Role',   align: 'center', width: 140 },
    { key: 'status',  label: 'Status', align: 'center', width: 120 },
    { key: 'login',   label: 'Last Login', align: 'center', width: 140 },
    { key: 'actions', label: 'Actions',align: 'center', width: 120 },
  ]

  const ROLES_DATA = [
    { name: 'Super Admin', description: 'Full access to all modules', users: data.filter(u=>u.role==='SuperAdmin').length, status: 'Active' },
    { name: 'Admin',       description: 'Manage franchises and billing',  users: data.filter(u=>u.role==='Admin').length,      status: 'Active' },
    { name: 'Manager',     description: 'View reports and manage customers', users: 0, status: 'Active' },
    { name: 'Billing',     description: 'Handle payments and invoices',   users: 0, status: 'Active' },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <Users size={20} className="text-[#1a73e8]" />
            Users & Roles
          </h1>
          <p className="text-sm text-gray-500">Manage admin users and their roles</p>
        </div>
        <button onClick={openAdd}
          className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-lg p-1 w-fit">
        {['users', 'roles'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '6px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all .15s',
              background: activeTab === tab ? '#1a73e8' : 'transparent',
              color: activeTab === tab ? '#fff' : '#6b7280' }}>
            {tab === 'users' ? 'Users' : 'Roles'}
          </button>
        ))}
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Search */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1a73e8]" />
            </div>
          </div>

          <AppTable columns={COLS} data={data} loading={loading}
            page={page} limit={limit} total={total}
            onPageChange={setPage} onPageSizeChange={s => { setLimit(s); setPage(1) }}
            rowKey={r => r._id} emptyText="No users found">
            {(row, i) => (
              <>
                <Td align="center">{(page-1)*limit+i+1}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#0f1f3d,#1e3a6e)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:700,flexShrink:0 }}>
                      {row.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 m-0 leading-tight">{row.name}</p>
                      <p className="text-xs text-gray-400 m-0">{row.userId}</p>
                    </div>
                  </div>
                </Td>
                <Td><span className="text-sm text-gray-600">{row.email || '—'}</span></Td>
                <Td align="center">
                  {(() => { const c = ROLE_COLORS[row.role] || ROLE_COLORS.Admin; return (
                    <span style={{ fontSize:'11px',fontWeight:600,padding:'2px 10px',borderRadius:'20px',background:c.bg,color:c.color,border:`1px solid ${c.border}` }}>
                      {row.role}
                    </span>
                  )})()}
                </Td>
                <Td align="center">
                  <span style={{ fontSize:'11px',fontWeight:600,padding:'2px 8px',borderRadius:'20px',
                    background:row.isActive?'#e8f8f0':'#fff1f1',color:row.isActive?'#16a34a':'#dc2626',
                    border:`1px solid ${row.isActive?'#bbf0d0':'#ffc5c5'}` }}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                </Td>
                <Td align="center">
                  <span className="text-xs text-gray-500">
                    {row.lastLogin ? new Date(row.lastLogin).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : 'Never'}
                  </span>
                </Td>
                <Td align="center">
                  <div className="flex justify-center gap-2">
                    <Tooltip title="Edit"><button onClick={() => openEdit(row)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-50 transition"><Edit size={14} /></button></Tooltip>
                  </div>
                </Td>
              </>
            )}
          </AppTable>
        </>
      ) : (
        /* Roles Table */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Role Name','Description','Users','Status','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs text-gray-500 font-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES_DATA.map((r, i) => {
                const c = ROLE_COLORS[r.name.replace(' ','')] || ROLE_COLORS.Admin
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Shield size={14} style={{ color: c.color }} />
                        <span className="font-medium text-gray-800">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{r.description}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{r.users}</td>
                    <td className="py-3 px-4">
                      <span style={{ fontSize:'11px',fontWeight:600,padding:'2px 8px',borderRadius:'20px',background:'#e8f8f0',color:'#16a34a',border:'1px solid #bbf0d0' }}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-50 transition">
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} title={editItem ? 'Edit User' : 'Add User'}
        onOk={handleSave} onCancel={() => setModalOpen(false)}
        confirmLoading={saving} okText={editItem ? 'Update' : 'Create'}
        okButtonProps={{ style: { background: '#1a73e8', borderColor: '#1a73e8' } }}>
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Enter email" />
          </Form.Item>
          {!editItem && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role">
              <Option value="SuperAdmin">Super Admin</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
