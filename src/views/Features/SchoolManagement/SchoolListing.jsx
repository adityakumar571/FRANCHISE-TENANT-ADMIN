import React, { useState, useEffect } from 'react'
import { Store, Plus, Eye, Edit, Trash2, CreditCard, Clock, LogIn, Gift } from 'lucide-react'
import { Tag, Switch, Tooltip } from 'antd'
import toast from 'react-hot-toast'
import { deleteRequest, getRequest, patchRequest } from '../../../Helpers'
import SchoolFilters from './SchoolFilters'
import FranchiseModal from './FranchiseModal'
import DeleteModal from '../../../components/DeleteModal/DeleteModal'
import AppTable, { Td } from '../../../components/AppTable'
import { useNavigate } from 'react-router-dom'
import SubscriptionModal from './subscriptionAddModal'
import QuickLoginModal from './QuickLoginModal'
import AssignTrialModal from './AssignTrialModal'

const SchoolListing = () => {
  const navigate = useNavigate()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const [appliedFilters, setAppliedFilters] = useState({ search: '', isActive: null })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [quickLoginSchool, setQuickLoginSchool] = useState(null)
  const [assignTrialSchool, setAssignTrialSchool] = useState(null)

  /* ── Fetch ── */
  const fetchSchools = () => {
    setLoading(true)
    const params = { page, limit, isPagination: true }
    if (appliedFilters.search) params.search = appliedFilters.search
    if (appliedFilters.isActive !== null) params.isActive = appliedFilters.isActive

    getRequest(`schools?${new URLSearchParams(params).toString()}`)
      .then((res) => {
        setData(res?.data?.data?.tenants || res?.data?.data?.list || [])
        setTotal(res?.data?.data?.total || res?.data?.data?.pagination?.totalRows || 0)
      })
      .catch(() => toast.error('Failed to load schools'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSchools() }, [appliedFilters, page, limit])

  /* ── Delete ── */
  const confirmDelete = async () => {
    if (!selectedItem) return
    setDeleteLoading(true)
    try {
      await deleteRequest(`schools/${selectedItem._id}`)
      toast.success('School deleted')
      setShowDeleteModal(false)
      setSelectedItem(null)
      fetchSchools()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleStatusChange = async (checked, record) => {
    try {
      const response = await patchRequest({ url: `schools/toggle-status/${record._id}` })
      toast.success(response?.data?.message || 'School updated successfully')
      fetchSchools()
    } catch (error) {
      toast.error(error?.response?.message || 'Failed to update school')
    }
  }

  /* ── Plan cell ── */
  const PlanCell = ({ row }) => {
    if (!row.planName) return <span className="text-gray-400 text-xs">No Plan</span>
    const statusColorMap = { ACTIVE: 'green', TRIAL: 'blue', EXPIRED: 'red', CANCELLED: 'volcano', PENDING: 'orange' }
    const isExpired = row.planEndDate && new Date(row.planEndDate) < new Date()
    const daysLeft = row.planEndDate
      ? Math.ceil((new Date(row.planEndDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null
    return (
      <Tooltip title={row.planEndDate ? `Expires: ${new Date(row.planEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <CreditCard size={12} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-700">{row.planName}</span>
            {row.isTrial && <Tag color="cyan" className="text-[10px] px-1 py-0 leading-tight ml-0.5">Trial</Tag>}
          </div>
          <div className="flex items-center gap-1">
            <Tag
              color={isExpired ? 'red' : statusColorMap[row.planStatus] || 'default'}
              className="text-[10px] px-1.5 py-0 leading-tight m-0"
            >
              {isExpired ? 'EXPIRED' : (row.planStatus || '—')}
            </Tag>
            {daysLeft !== null && !isExpired && daysLeft <= 30 && (
              <span className="text-[10px] text-orange-500 flex items-center gap-0.5">
                <Clock size={10} /> {daysLeft}d left
              </span>
            )}
          </div>
          {row.studentLimit > 0 && (
            <span className="text-[10px] text-gray-400">{row.studentLimit.toLocaleString()} students</span>
          )}
        </div>
      </Tooltip>
    )
  }

  /* ── Column definitions ── */
  const COLUMNS = [
    { key: 'sr',         label: 'Sr.',        align: 'center', width: 60,  sticky: 'left'  },
    { key: 'school',     label: 'Franchise Name', align: 'left',   width: 220 },
    { key: 'subdomain',  label: 'Subdomain',  align: 'center', width: 180 },
    { key: 'db',         label: 'Database',   align: 'center', width: 110 },
    { key: 'plan',       label: 'Plan',       align: 'center', width: 180 },
    { key: 'status',     label: 'Status',     align: 'center', width: 120 },
    { key: 'registered', label: 'Registered', align: 'center', width: 130 },
    { key: 'actions',    label: 'Actions',    align: 'center', width: 200, sticky: 'right' },
  ]

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <Store size={20} className="text-[#1a73e8]" />
            Franchise Management
          </h1>
          <p className="text-sm text-gray-500">Manage all registered franchises</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedItem(null); setIsSubModalOpen(true) }}
            className="bg-[#0c3b73] hover:bg-[#0a2f5c] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
          >
            <Plus size={16} /> Add Subscription
          </button>
          <button
            onClick={() => { setSelectedItem(null); setIsModalOpen(true) }}
            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
          >
            <Plus size={16} /> Add Franchise
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <SchoolFilters
        appliedFilters={appliedFilters}
        onApply={(f) => { setAppliedFilters(f); setPage(1) }}
        onClear={() => { setAppliedFilters({ search: '', isActive: null }); setPage(1) }}
      />

      {/* ── Table ── */}
      <AppTable
        columns={COLUMNS}
        data={data}
        loading={loading}
        emptyText="No schools found"
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => { setLimit(size); setPage(1) }}
        rowKey={(row) => row._id}
        onRowClick={(row) => navigate(`/franchise-management/details/${row._id}`)}
      >
        {(row, index) => (
          <>
            {/* Sr */}
            <Td align="center" sticky="left">{(page - 1) * limit + index + 1}</Td>

            {/* School */}
            <Td>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                  {row.logo
                    ? <img src={row.logo} alt="" className="w-full h-full object-contain p-0.5" />
                    : <Store size={16} className="text-gray-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-tight">{row.schoolName || row.name}</p>
                  {row.description && <p className="text-xs text-gray-400 truncate max-w-[180px]">{row.description}</p>}
                </div>
              </div>
            </Td>

            {/* Subdomain */}
            <Td align="center">
              {row.subdomain
                ? <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">{row.subdomain}</span>
                : <span className="text-gray-400 text-xs">—</span>}
            </Td>

            {/* Database */}
            <Td align="center">
              {row.dbUri
                ? <Tag color="purple" className="text-xs">Custom DB</Tag>
                : <Tag color="default" className="text-xs">Shared DB</Tag>}
            </Td>

            {/* Plan */}
            <Td align="center"><PlanCell row={row} /></Td>

            {/* Status */}
            <Td align="center" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={row.isActive}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                onChange={(checked) => handleStatusChange(checked, row)}
              />
            </Td>

            {/* Registered */}
            <Td align="center">
              {row.createdAt
                ? <span className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                : <span className="text-gray-400 text-xs">—</span>}
            </Td>

            {/* Actions */}
            <Td align="center" sticky="right" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-center gap-2">
                <Tooltip title="Quick Login">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#0c3b73] hover:text-white hover:bg-[#0c3b73] transition-all" onClick={() => setQuickLoginSchool(row)}>
                    <LogIn className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip title="Assign Free Trial">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 hover:text-white hover:bg-blue-600 transition-all" onClick={() => setAssignTrialSchool(row)}>
                    <Gift className="w-4 h-4" />
                  </button>
                </Tooltip>
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-green-600 hover:text-white hover:bg-green-600 transition-all" onClick={() => navigate(`/franchise-management/details/${row._id}`)}>
                  <Eye className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-blue-600 hover:text-white hover:bg-blue-600 transition-all" onClick={() => { setSelectedItem(row); setIsModalOpen(true) }}>
                  <Edit className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-red-600 hover:text-white hover:bg-red-600 transition-all" onClick={() => { setSelectedItem(row); setShowDeleteModal(true) }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Td>
          </>
        )}
      </AppTable>

      {/* ── Modals ── */}
      <DeleteModal
        open={showDeleteModal}
        itemName={selectedItem?.schoolName || selectedItem?.name}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setSelectedItem(null) }}
      />

      {isModalOpen && (
        <FranchiseModal
          key={selectedItem?._id || 'new'}
          open={isModalOpen}
          editData={selectedItem}
          onClose={() => setIsModalOpen(false)}
          refresh={() => { setPage(1); fetchSchools() }}
        />
      )}

      {isSubModalOpen && (
        <SubscriptionModal
          open={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
          refresh={() => { setPage(1); fetchSchools() }}
        />
      )}

      <QuickLoginModal
        open={!!quickLoginSchool}
        school={quickLoginSchool}
        onClose={() => setQuickLoginSchool(null)}
      />

      <AssignTrialModal
        open={!!assignTrialSchool}
        school={assignTrialSchool}
        onClose={() => setAssignTrialSchool(null)}
        onSuccess={() => { setAssignTrialSchool(null); fetchSchools() }}
      />
    </div>
  )
}

export default SchoolListing
