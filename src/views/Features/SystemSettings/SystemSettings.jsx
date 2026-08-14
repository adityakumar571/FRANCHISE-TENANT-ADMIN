/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Settings, Save, Globe, Mail, Shield, Bell } from 'lucide-react'
import { Form, Input, Select, Switch, Button } from 'antd'
import toast from 'react-hot-toast'

const { Option } = Select

const TABS = [
  { key: 'general',  label: 'General Settings',  icon: Globe   },
  { key: 'web',      label: 'Web Settings',       icon: Globe   },
  { key: 'email',    label: 'Email Settings',     icon: Mail    },
  { key: 'security', label: 'Security Settings',  icon: Shield  },
  { key: 'notify',   label: 'Notification Settings', icon: Bell },
]

function FieldRow({ label, children }) {
  return (
    <div style={{ display:'flex',alignItems:'flex-start',gap:'16px',padding:'12px 0',borderBottom:'1px solid #f3f4f6' }}>
      <label style={{ width:'200px',flexShrink:0,fontSize:'13px',fontWeight:600,color:'#374151',paddingTop:'6px' }}>{label}</label>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  )
}

function inputStyle(extra={}) {
  return { height:'36px',fontSize:'13px',borderRadius:'8px',border:'1px solid #e5e7eb',...extra }
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [generalForm] = Form.useForm()
  const [emailForm]   = Form.useForm()

  const handleSave = async (formInstance) => {
    try {
      await formInstance.validateFields()
      setSaving(true)
      await new Promise(r => setTimeout(r, 800))
      toast.success('Settings saved successfully')
    } catch { /* validation error */ }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div style={{ background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'16px 20px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:'16px',fontWeight:700,color:'#111827',margin:0,display:'flex',alignItems:'center',gap:'8px' }}>
            <Settings size={20} style={{ color:'#1a73e8' }} /> System Settings
          </h1>
          <p style={{ fontSize:'13px',color:'#9ca3af',margin:0 }}>Configure platform-wide settings</p>
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'220px 1fr',gap:'16px' }}>
        {/* Sidebar tabs */}
        <div style={{ background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'8px',height:'fit-content' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,marginBottom:'2px',transition:'all .15s',
                background: activeTab===key ? '#e8f1ff' : 'transparent',
                color:      activeTab===key ? '#1a73e8' : '#6b7280' }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px' }}>

          {activeTab === 'general' && (
            <Form form={generalForm} layout="vertical">
              <h2 style={{ fontSize:'15px',fontWeight:700,color:'#111827',marginBottom:'20px' }}>General Settings</h2>
              <FieldRow label="Platform Name">
                <Input defaultValue="FranchizeAll" style={inputStyle()} placeholder="Platform name" />
              </FieldRow>
              <FieldRow label="Admin Email">
                <Input defaultValue="admin@franchizeall.com" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="Support Email">
                <Input defaultValue="support@franchizeall.com" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="Contact Number">
                <Input defaultValue="+91 99999 99999" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="Address">
                <Input.TextArea rows={2} defaultValue="New Delhi, India" style={{ fontSize:'13px',borderRadius:'8px',border:'1px solid #e5e7eb' }} />
              </FieldRow>
              <FieldRow label="Timezone">
                <Select defaultValue="Asia/Kolkata" style={{ width:'100%',height:36 }}>
                  <Option value="Asia/Kolkata">Asia/Kolkata (IST)</Option>
                  <Option value="UTC">UTC</Option>
                </Select>
              </FieldRow>
              <FieldRow label="Date Format">
                <Select defaultValue="DD/MM/YYYY" style={{ width:'100%',height:36 }}>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                </Select>
              </FieldRow>
              <div style={{ marginTop:'20px',display:'flex',justifyContent:'flex-end' }}>
                <Button type="primary" loading={saving} onClick={() => handleSave(generalForm)}
                  style={{ background:'#1a73e8',borderColor:'#1a73e8',height:'36px',borderRadius:'8px',fontWeight:600 }}>
                  <Save size={14} style={{ marginRight:'6px' }} /> Save Changes
                </Button>
              </div>
            </Form>
          )}

          {activeTab === 'web' && (
            <div>
              <h2 style={{ fontSize:'15px',fontWeight:700,color:'#111827',marginBottom:'20px' }}>Web Settings</h2>
              <FieldRow label="Site URL">
                <Input defaultValue="https://franchizeall.com" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="Logo URL">
                <Input defaultValue="" placeholder="Enter logo URL" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="Favicon URL">
                <Input defaultValue="" placeholder="Enter favicon URL" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="Maintenance Mode">
                <Switch defaultChecked={false} />
              </FieldRow>
              <div style={{ marginTop:'20px',display:'flex',justifyContent:'flex-end' }}>
                <Button type="primary" loading={saving} onClick={() => { setSaving(true); setTimeout(()=>{ setSaving(false); toast.success('Saved') },800) }}
                  style={{ background:'#1a73e8',borderColor:'#1a73e8',height:'36px',borderRadius:'8px',fontWeight:600 }}>
                  <Save size={14} style={{ marginRight:'6px' }} /> Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <Form form={emailForm} layout="vertical">
              <h2 style={{ fontSize:'15px',fontWeight:700,color:'#111827',marginBottom:'20px' }}>Email Settings</h2>
              <FieldRow label="SMTP Host">
                <Input defaultValue="smtp.gmail.com" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="SMTP Port">
                <Input defaultValue="587" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="SMTP Username">
                <Input defaultValue="noreply@franchizeall.com" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="SMTP Password">
                <Input.Password defaultValue="••••••••" style={inputStyle()} />
              </FieldRow>
              <FieldRow label="From Name">
                <Input defaultValue="FranchizeAll Support" style={inputStyle()} />
              </FieldRow>
              <div style={{ marginTop:'20px',display:'flex',justifyContent:'flex-end' }}>
                <Button type="primary" loading={saving} onClick={() => handleSave(emailForm)}
                  style={{ background:'#1a73e8',borderColor:'#1a73e8',height:'36px',borderRadius:'8px',fontWeight:600 }}>
                  <Save size={14} style={{ marginRight:'6px' }} /> Save Changes
                </Button>
              </div>
            </Form>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize:'15px',fontWeight:700,color:'#111827',marginBottom:'20px' }}>Security Settings</h2>
              {[
                { label:'Two-Factor Authentication', desc:'Require 2FA for all admin logins', default:false },
                { label:'Session Timeout',           desc:'Auto logout after 30 minutes of inactivity', default:true },
                { label:'Login Alerts',              desc:'Send email on new login from unknown device', default:true },
                { label:'IP Whitelist',              desc:'Restrict access to specific IP addresses', default:false },
              ].map((item, i) => (
                <FieldRow key={i} label={item.label}>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <span style={{ fontSize:'12px',color:'#9ca3af' }}>{item.desc}</span>
                    <Switch defaultChecked={item.default} />
                  </div>
                </FieldRow>
              ))}
            </div>
          )}

          {activeTab === 'notify' && (
            <div>
              <h2 style={{ fontSize:'15px',fontWeight:700,color:'#111827',marginBottom:'20px' }}>Notification Settings</h2>
              {[
                { label:'New Franchise Registration', desc:'Notify when a new franchise registers', default:true },
                { label:'Subscription Expiry Alert',  desc:'Alert 7 days before subscription expires', default:true },
                { label:'Payment Received',           desc:'Notify on every payment received', default:true },
                { label:'Overdue Payment Alert',      desc:'Alert when payment is overdue', default:true },
                { label:'Support Ticket Created',     desc:'Notify when a new support ticket is raised', default:false },
              ].map((item, i) => (
                <FieldRow key={i} label={item.label}>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <span style={{ fontSize:'12px',color:'#9ca3af' }}>{item.desc}</span>
                    <Switch defaultChecked={item.default} />
                  </div>
                </FieldRow>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
