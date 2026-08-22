/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */

import { useEffect, useState } from 'react'
import { getRequest } from '../../../../Helpers'
import { useNavigate, useParams } from 'react-router-dom'

import {
  ArrowLeft,
  School,
  Store,
  Users,
  UserCheck,
  Layers3,
  GraduationCap,
  ShieldCheck,
  CalendarDays,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  BadgeCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Database,
  BarChart3,
  BookOpen,
  LogIn,
} from 'lucide-react'
import QuickLoginModal from '../QuickLoginModal'
import InstallmentTracker from './InstallmentTracker'
import SubscriptionStatusPanel from './SubscriptionStatusPanel'

/* ─────────────────── STAT CARD ──────────────────────────── */
function StatCard({ title, value, icon: Icon, color, subtitle }) {

  return (

    <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 group h-full">

      <div className="flex items-start justify-between gap-5 h-full">

        {/* LEFT */}
        <div className="flex flex-col justify-between h-full flex-1 min-w-0">

          <div>

            <p className="text-[18px] font-medium text-slate-800 leading-snug">
              {title}
            </p>

            <h2 className="text-xl font-medium text-slate-800 mt-2">
              {value}
            </h2>

          </div>

          {/* <div className="mt-6">

            <p
              className="text-sm font-semibold"
              style={{ color }}
            >
              {subtitle}
            </p>


          </div> */}

        </div>

        {/* RIGHT ICON */}
        <div
          className="
            w-14 h-14
            rounded-2xl
            flex items-center justify-center
            flex-shrink-0
            shadow-md
            transition-all duration-300
            group-hover:scale-105
          "
          style={{
            background: color,
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

      </div>




    </div>
  )
}
/* ─────────────────── INFO ROW ───────────────────────────── */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-1 py-1 border-b border-slate-100 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 break-words mt-1">{value || '--'}</p>
      </div>
    </div>
  )
}

/* ─────────────────── CREDENTIALS CARD ───────────────────── */
function CredentialsCard({ credentials }) {
  const [showPass, setShowPass] = useState(false)
  const [copied, setCopied] = useState(null)

  if (!credentials) return null

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
  <div className="flex items-center gap-4 mb-2">

  {/* ICON */}
  <div
    className="
      w-12 h-12
      rounded-2xl
      flex items-center justify-center
      flex-shrink-0
      shadow-sm
    "
    style={{
      background: '#7C3AED',
    }}
  >
    <ShieldCheck className="w-6 h-6 text-white" />
  </div>

  {/* TEXT */}
  <div>

    <h2 className="text-[18px] font-medium text-slate-800">
      Super Admin Credentials
    </h2>

    <p className="text-sm font-medium text-slate-400 mt-0.5">
      Franchise login information
    </p>

  </div>

</div>

        {/* USER ID */}
        <div className="flex items-center justify-between border border-slate-200 rounded-2xl p-4 mb-4">
          <div>
            <p className="text-xs font-medium text-slate-400">User ID</p>
            <p className="text-sm font-medium text-slate-800 mt-1">{credentials.userId}</p>
          </div>
          <button
            onClick={() => copyText(credentials.userId, 'user')}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border-0 cursor-pointer active:scale-95 transition-transform flex-shrink-0"
          >
            {copied === 'user' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        {/* PASSWORD */}
        <div className="flex items-center justify-between border border-slate-200 rounded-2xl p-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Password</p>
            <p className="text-sm font-medium text-slate-800 mt-1 tracking-widest">
              {showPass ? credentials.password : '••••••••'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowPass(!showPass)}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border-0 cursor-pointer active:scale-95 transition-transform"
            >
              {showPass ? <EyeOff className="w-5 h-5 text-slate-600" /> : <Eye className="w-5 h-5 text-slate-600" />}
            </button>
            <button
              onClick={() => copyText(credentials.password, 'pass')}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border-0 cursor-pointer active:scale-95 transition-transform"
            >
              {copied === 'pass' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── MAIN DASHBOARD ─────────────────────── */
export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [apiData, setApiData] = useState(null)
  const [quickLoginOpen, setQuickLoginOpen] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()

  const fetchData = async () => {
    try {
      const res = await getRequest(`schools/${id}`)
      setApiData(res?.data?.data || null)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!apiData || !apiData.tenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <School className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">Failed to load franchise profile</p>
          <p className="text-sm text-slate-400">The franchise database may be unavailable or the ID is invalid.</p>
          <button
            onClick={() => { setLoading(true); fetchData() }}
            className="mt-2 px-5 py-2 bg-[#0c3b73] text-white text-sm rounded-xl hover:bg-[#0a2f5c] transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { tenant, stats, session, subscription, credentials } = apiData

  const totalStudents = stats?.totalStudents || 0
  const maleStudents = stats?.totalMStudents || 0
  const femaleStudents = stats?.totalFStudents || 0
  const totalTeachers = stats?.totalTeachers || 0
  const totalClasses = stats?.totalClasses || 0
  const totalSections = stats?.totalSections || 0

  return (
    <div className="min-h-screen space-y-6">

      {/* HEADER (Perfectly Aligned & Contained) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          {/* Left Side Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center border-0 hover:bg-slate-200 cursor-pointer transition flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>

            {tenant.logo ? (
              <img src={tenant.logo} alt="logo" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-medium text-slate-800 tracking-tight">{tenant.schoolName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${tenant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {tenant.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {tenant.statusOfSchool || 'Secondary/Sr. Secondary'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                  {session?.sessionName}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side Info */}
          <div className="md:text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 flex flex-col items-start md:items-end gap-3">
            <div>
              <p className="text-xs text-slate-400 font-medium">Subdomain</p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {tenant.subdomain || 'pns'}.franchisecloudx.com
              </p>
            </div>
            {/* ⚡ Quick Login Button */}
            <button
              onClick={() => setQuickLoginOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0c3b73] hover:bg-[#0a2f5c] text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              <LogIn size={15} />
              Quick Login to Franchise
            </button>
          </div>

        </div>
      </div>

      {/* BODY PANEL */}
      <div className="space-y-6">
        {/* TOP ROW: STATS HERO CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">

          {/* STUDENTS */}
          <StatCard
            title="Students"
            value={totalStudents}
            icon={GraduationCap}
            color="#0F3B73"
            subtitle={`${maleStudents} Male · ${femaleStudents} Female`}
          />

          {/* TEACHERS */}
          <StatCard
            title="Teachers"
            value={totalTeachers}
            icon={Users}
            color="#1E4E8C"
            subtitle={`${totalTeachers} Active Teachers`}
          />

          {/* CLASSES */}
          <StatCard
            title="Classes"
            value={totalClasses}
            icon={BookOpen}
            color="#2F6F4F"
            subtitle={`${totalClasses} Active Classes`}
          />

          {/* SECTIONS */}
          <StatCard
            title="Sections"
            value={totalSections}
            icon={Layers3}
            color="#8B2E2E"
            subtitle={`${totalSections} Sections`}
          />

        </div>
        {/* METRICS ROW: DOUBLE BLOCK GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT CONTENT BLOCK */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            {/* SCHOOL DETAILS BOX */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-[18px] font-medium text-slate-800">Franchise Information</h2>
                  <p className="text-sm font-medium text-slate-400 mt-0.5">Business details & contact info</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow icon={Phone} label="Primary Contact" value={tenant.schoolContact} />
                <InfoRow icon={Phone} label="Alternate Contact" value={tenant.schoolContactAlt} />
                <InfoRow icon={Mail} label="Register Email" value={tenant.schoolEmail} />
                <InfoRow icon={BadgeCheck} label="School Code" value={tenant.schoolCode} />
                <InfoRow icon={CalendarDays} label="Established No" value={tenant.estNo} />
                <InfoRow icon={GraduationCap} label="Medium" value={tenant.schoolMedium} />

                {/* Structured Address */}
                <InfoRow icon={MapPin} label="Address Line 1" value={tenant.addressLine1} />
                <InfoRow icon={MapPin} label="City / District" value={tenant.city} />
                <InfoRow icon={MapPin} label="State" value={tenant.state} />
                <InfoRow icon={Globe} label="Country" value={tenant.country} />
                <InfoRow icon={MapPin} label="Pincode" value={tenant.pincode} />

                <InfoRow icon={BadgeCheck} label="Affiliation Line" value={tenant.affiliationLine} />
                <InfoRow icon={BadgeCheck} label="Affiliation No" value={tenant.affiliationNo} />
                <InfoRow icon={Database} label="MSME Reg No" value={tenant.msmeRegNo} />
                <InfoRow icon={ShieldCheck} label="ISO Reg No" value={tenant.isoRegNo} />
                <InfoRow icon={Building2} label="Niti Aayog" value={tenant.nitiAayog} />
                <InfoRow icon={Globe} label="Managed By" value={tenant.managedBy} />
              </div>

              {/* Contact Persons */}
              {(tenant.contactPerson1?.name || tenant.contactPerson2?.name) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact Persons</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[tenant.contactPerson1, tenant.contactPerson2].map((cp, idx) =>
                      cp?.name ? (
                        <div key={idx} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase mb-2">Person {idx + 1}</p>
                          <p className="text-sm font-medium text-slate-800">{cp.name}</p>
                          {cp.designation && <p className="text-xs text-slate-500 mt-0.5">{cp.designation}</p>}
                          {cp.contactNo && (
                            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {cp.contactNo}
                            </p>
                          )}
                          {cp.email && (
                            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {cp.email}
                            </p>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PLATFORM ANALYTICS SUMMARY */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-[18px] font-medium text-slate-800">Platform Statistics</h2>
                  <p className="text-sm font-medium text-slate-400 mt-0.5">Overall franchise analytics</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-2xl bg-slate-50 p-2 text-center">
                  <Users className="w-7 h-7 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-medium text-slate-800">{maleStudents}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Male Students</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-2 text-center">
                  <Users className="w-7 h-7 text-pink-600 mx-auto mb-1" />
                  <p className="text-2xl font-medium text-slate-800">{femaleStudents}</p>
                  <p className="text-xs font-medium text-slate-500 mt-2">Female Students</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-2 text-center">
                  <Layers3 className="w-7 h-7 text-amber-600 mx-auto mb-1" />
                  <p className="text-2xl font-medium text-slate-800">{totalSections}</p>
                  <p className="text-xs font-medium text-slate-500 mt-2">Sections</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-2 text-center">
                  <Database className="w-7 h-7 text-violet-600 mx-auto mb-1" />
                  <p className="text-2xl font-medium text-slate-800">{subscription?.usedStudents || 0}</p>
                  <p className="text-xs font-medium text-slate-500 mt-2">Used Capacity</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT BLOCK — Subscription + Credentials only */}
          <div className="space-y-6 flex flex-col">
            {/* SUBSCRIPTION PANEL — full real-time status with addon breakdown */}
            <SubscriptionStatusPanel
              tenantId={tenant._id}
              onAssignPlan={() => navigate('/subscription-plans')}
              onAddAddon={() => navigate('/subscription-plans')}
            />

            {/* CREDENTIALS */}
            <CredentialsCard credentials={credentials} />
          </div>
        </div>

        {/* FULL WIDTH BOTTOM ROW — Installment only */}
        <div className="grid grid-cols-1 gap-6">
          <InstallmentTracker tenantId={tenant._id} schoolName={tenant.schoolName} />
        </div>
      </div>

      {/* Quick Login Modal */}
      <QuickLoginModal
        open={quickLoginOpen}
        school={tenant}
        onClose={() => setQuickLoginOpen(false)}
      />
    </div>
  )
}