/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Activity, Search, Filter, Download } from 'lucide-react'
import { Select, DatePicker } from 'antd'
import AppTable, { Td } from '../../../components/AppTable'
import { getRequest } from '../../../Helpers'

const { Option } = Select
const { RangePicker } = DatePicker

const ACTION_COLORS = {
  Create:  { bg:'#e8f8f0', color:'#16a34a', border:'#bbf0d0' },
  Update:  { bg:'#e8f1ff', color:'#1a73e8', border:'#c5d8ff' },
  Delete:  { bg:'#fff1f1', color:'#dc2626', border:'#ffc5c5' },
  Login:   { bg:'#f0ecff', color:'#7c3aed', border:'#d4c8ff' },
  Payment: { bg:'#fff4e6', color:'#ea7c1e', border:'#ffd9a8' },
  Billing: { bg:'#fffbeb', color:'#d97706', border:'#fde68a' },
}

// Mock data for demo
const MOCK_LOGS = [
  { _id:'1', user:'Super Admin', email:'superadmin@franchizeall.com', action:'Create', module:'Franchise', description:'New franchise "Sharma Medical Store" has been created', ip:'192.168.1.1', createdAt: new Date().toISOString() },
  { _id:'2', user:'Admin',       email:'admin@franchizeall.com',      action:'Payment', module:'Billing',   description:'Payment of ₹12,000 received from Verma Pharmacy', ip:'192.168.1.2', createdAt: new Date(Date.now()-3600000).toISOString() },
  { _id:'3', user:'Super Admin', email:'superadmin@franchizeall.com', action:'Update',  module:'Subscription', description:'Subscription of "Patel Drug House" updated to Enterprise plan', ip:'192.168.1.1', createdAt: new Date(Date.now()-7200000).toISOString() },
  { _id:'4', user:'Admin',       email:'admin@franchizeall.com',      action:'Login',   module:'Auth',      description:'Admin logged in from new device', ip:'103.25.4.5', createdAt: new Date(Date.now()-10800000).toISOString() },
  { _id:'5', user:'Super Admin', email:'superadmin@franchizeall.com', action:'Delete',  module:'User',      description:'User account deleted: john.doe@example.com', ip:'192.168.1.1', createdAt: new Date(Date.now()-18000000).toISOString() },
  { _id:'6', user:'Admin',       email:'admin@franchizeall.com',      action:'Create',  module:'Plan',      description:'New subscription plan "Custom Enterprise" created', ip:'192.168.1.2', createdAt: new Date(Date.now()-86400000).toISOString() },
  { _id:'7', user:'Super Admin', email:'superadmin@franchizeall.com', action:'Billing', module:'Billing',   description:'Monthly bill generated for Gupta Medicals', ip:'192.168.1.1', createdAt: new Date(Date.now()-172800000).toISOString() },
  { _id:'8', user:'Admin',       email:'admin@franchizeall.com',      action:'Update',  module:'Franchise', description:'Franchise "Khan Pharmacy" status changed to Active', ip:'192.168.1.2', createdAt: new Date(Date.now()-259200000).toISOString() },
]

export default function ActivityLogs() {
  const [data, setData]       = useState(MOCK_LOGS)
  const [loading, setLoading] = useState(false)
  const [page, setPage]       = useState(1)
  const [limit, setLimit]     = useState(10)
  const [total, setTotal]     = useState(MOCK_LOGS.length)
  const [search, setSearch]   = useState('')
  const [actionFilter, setActionFilter] = useState(null)

  const filtered = data.filter(row => {
    const matchSearch = !search || row.description.toLowerCase().includes(search.toLowerCase()) || row.user.toLowerCase().includes(search.toLowerCase())
    const matchAction = !actionFilter || row.action === actionFilter
    return matchSearch && matchAction
  })

  const COLS = [
    { key:'sr',     label:'Sr.',        align:'center', width:60  },
    { key:'time',   label:'Time',       align:'center', width:160 },
    { key:'user',   label:'User',       align:'left',   width:180 },
    { key:'action', label:'Action',     align:'center', width:110 },
    { key:'module', label:'Module',     align:'center', width:120 },
    { key:'desc',   label:'Description',align:'left',   width:320 },
    { key:'ip',     label:'IP Address', align:'center', width:130 },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div style={{ background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'16px 20px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:'16px',fontWeight:700,color:'#111827',margin:0,display:'flex',alignItems:'center',gap:'8px' }}>
            <Activity size={20} style={{ color:'#1a73e8' }} /> Activity Logs
          </h1>
          <p style={{ fontSize:'13px',color:'#9ca3af',margin:0 }}>Track all system activities and changes</p>
        </div>
        <button style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'8px',border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:600,color:'#374151' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* Filters */}
      <div style={{ background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'12px 16px',marginBottom:'16px',display:'flex',gap:'12px',flexWrap:'wrap' }}>
        <div style={{ position:'relative',flex:1,minWidth:'200px' }}>
          <Search size={13} style={{ position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            style={{ width:'100%',paddingLeft:'32px',paddingRight:'12px',height:'34px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'13px',outline:'none' }} />
        </div>
        <Select value={actionFilter} onChange={setActionFilter} allowClear placeholder="Filter by action"
          style={{ width:'160px',height:'34px' }}>
          {Object.keys(ACTION_COLORS).map(a => <Option key={a} value={a}>{a}</Option>)}
        </Select>
        <RangePicker style={{ height:'34px',fontSize:'13px' }} />
      </div>

      {/* Table */}
      <AppTable columns={COLS} data={filtered.slice((page-1)*limit, page*limit)} loading={loading}
        page={page} limit={limit} total={filtered.length}
        onPageChange={setPage} onPageSizeChange={s=>{ setLimit(s);setPage(1) }}
        rowKey={r=>r._id} emptyText="No activity logs found">
        {(row, i) => (
          <>
            <Td align="center">{(page-1)*limit+i+1}</Td>
            <Td align="center">
              <span style={{ fontSize:'11px',color:'#6b7280' }}>
                {new Date(row.createdAt).toLocaleString('en-IN',{ day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' })}
              </span>
            </Td>
            <Td>
              <div>
                <p style={{ fontSize:'12px',fontWeight:600,color:'#111827',margin:0 }}>{row.user}</p>
                <p style={{ fontSize:'11px',color:'#9ca3af',margin:0 }}>{row.email}</p>
              </div>
            </Td>
            <Td align="center">
              {(() => { const c = ACTION_COLORS[row.action] || ACTION_COLORS.Update; return (
                <span style={{ fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'20px',background:c.bg,color:c.color,border:`1px solid ${c.border}` }}>
                  {row.action}
                </span>
              )})()}
            </Td>
            <Td align="center">
              <span style={{ fontSize:'11px',fontWeight:600,color:'#374151',background:'#f3f4f6',padding:'2px 8px',borderRadius:'6px' }}>{row.module}</span>
            </Td>
            <Td><span style={{ fontSize:'12px',color:'#374151' }}>{row.description}</span></Td>
            <Td align="center">
              <code style={{ fontSize:'11px',color:'#6b7280',background:'#f3f4f6',padding:'2px 6px',borderRadius:'4px' }}>{row.ip}</code>
            </Td>
          </>
        )}
      </AppTable>
    </div>
  )
}
