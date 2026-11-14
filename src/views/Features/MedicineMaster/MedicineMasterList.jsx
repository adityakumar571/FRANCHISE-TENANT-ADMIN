import React, { useState, useEffect } from 'react'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CInputGroup,
  CFormInput,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CPagination,
  CPaginationItem,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { Search, Plus, Edit3, Trash2, Eye, Download } from 'lucide-react'
import { getRequest, deleteRequest } from '../../../Helpers'

const MedicineMasterList = () => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchMedicines()
  }, [currentPage, searchTerm])

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const response = await getRequest(
        `/superadmin/medicines?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`,
      )

      console.log('📊 API Response:', response)
      console.log('📋 Medicines:', response.data?.data?.medicines)
      console.log('📄 Pagination:', response.data?.data?.pagination)

      if (response.data?.success) {
        setMedicines(response.data?.data?.medicines || [])
        // Updated: Extract total from pagination object
        setTotal(response.data?.data?.pagination?.total || 0)
        setError(null)
      }
    } catch (err) {
      console.error('❌ Fetch error:', err)
      setError(err.response?.data?.message || 'Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await deleteRequest(`/superadmin/medicines/${medicineId}`)
        setMedicines(medicines.filter((m) => m._id !== medicineId))
      } catch (err) {
        setError('Failed to delete medicine')
      }
    }
  }

  const handleExport = async () => {
    try {
      const response = await getRequest('/superadmin/medicines/export/excel')

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `MedicineMaster_${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      setError('Failed to export medicines')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Medicine Master</h5>
          <div className="d-flex gap-2">
            <CButton
              color="info"
              size="sm"
              onClick={handleExport}
              className="d-flex align-items-center gap-2"
            >
              <Download size={16} /> Export
            </CButton>
            <CButton
              color="success"
              size="sm"
              href="/medicine-master/add"
              className="d-flex align-items-center gap-2"
            >
              <Plus size={16} /> Add Medicine
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}

          <CInputGroup className="mb-3">
            <CFormInput
              placeholder="Search by name, generic name, or manufacturer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              prefix={<Search size={16} />}
            />
          </CInputGroup>

          {loading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" />
            </div>
          ) : medicines.length === 0 ? (
            <CAlert color="warning">No medicines found</CAlert>
          ) : (
            <>
              <div className="table-responsive">
                <CTable hover striped>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell style={{ width: '12%' }}>Medicine ID</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '20%' }}>Generic Name</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '18%' }}>Manufacturer</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '15%' }}>Medical System</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '12%' }} className="text-end">MRP</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '10%' }}>Status</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '13%' }}>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {medicines.map((medicine) => (
                      <CTableRow key={medicine._id}>
                        <CTableDataCell className="text-monospace small">{medicine.medicine_id}</CTableDataCell>
                        <CTableDataCell>
                          <strong>{medicine.generic_name}</strong>
                          {medicine.brand_names?.length > 0 && (
                            <div className="small text-muted">{medicine.brand_names.slice(0, 2).join(', ')}</div>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>{medicine.manufacturer || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <span className="badge bg-primary">{medicine.medical_system}</span>
                        </CTableDataCell>
                        <CTableDataCell className="fw-bold text-end">₹{medicine.mrp}</CTableDataCell>
                        <CTableDataCell>
                          <span className={`badge bg-${medicine.isActive ? 'success' : 'danger'}`}>
                            {medicine.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CButton
                              color="info"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMedicine(medicine)
                                setShowModal(true)
                              }}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </CButton>
                            <CButton
                              color="warning"
                              size="sm"
                              variant="outline"
                              href={`/medicine-master/edit/${medicine._id}`}
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(medicine._id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({total.toLocaleString()} total)
                  </div>
                  <CPagination className="mb-0" style={{ maxWidth: '600px', overflowX: 'auto' }}>
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      title="First page"
                    >
                      {'<<'}
                    </CPaginationItem>
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    >
                      Previous
                    </CPaginationItem>

                    {/* Smart pagination - show first, current range, and last pages */}
                    {totalPages <= 10 ? (
                      // If less than 10 pages, show all
                      [...Array(totalPages)].map((_, i) => (
                        <CPaginationItem
                          key={i + 1}
                          active={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))
                    ) : (
                      <>
                        {/* Always show first page */}
                        <CPaginationItem
                          active={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </CPaginationItem>

                        {/* Show ellipsis if gap */}
                        {currentPage > 4 && <CPaginationItem disabled>...</CPaginationItem>}

                        {/* Show current range (current page +/- 2) */}
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const pageNum = Math.max(2, Math.min(currentPage - 2 + i, totalPages - 1))
                          return pageNum > 1 && pageNum < totalPages ? (
                            <CPaginationItem
                              key={pageNum}
                              active={currentPage === pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </CPaginationItem>
                          ) : null
                        })}

                        {/* Show ellipsis if gap */}
                        {currentPage < totalPages - 3 && <CPaginationItem disabled>...</CPaginationItem>}

                        {/* Always show last page */}
                        <CPaginationItem
                          active={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </CPaginationItem>
                      </>
                    )}

                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    >
                      Next
                    </CPaginationItem>
                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      title="Last page"
                    >
                      {'>>'}
                    </CPaginationItem>
                  </CPagination>
                </div>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Detail Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Medicine Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedMedicine && (
            <div className="row g-3">
              <div className="col-md-6">
                <strong>Medicine ID:</strong>
                <div className="text-monospace bg-light p-2 rounded small">{selectedMedicine.medicine_id}</div>
              </div>
              <div className="col-md-6">
                <strong>Generic Name:</strong>
                <div className="fw-bold">{selectedMedicine.generic_name}</div>
              </div>
              <div className="col-md-6">
                <strong>Brand Names:</strong>
                <div>{selectedMedicine.brand_names?.join(', ') || '-'}</div>
              </div>
              <div className="col-md-6">
                <strong>Manufacturer:</strong>
                <div>{selectedMedicine.manufacturer || '-'}</div>
              </div>
              <div className="col-md-6">
                <strong>Medical System:</strong>
                <div>
                  <span className="badge bg-primary">{selectedMedicine.medical_system}</span>
                </div>
              </div>
              <div className="col-md-6">
                <strong>MRP:</strong>
                <div className="fw-bold">₹{selectedMedicine.mrp}</div>
              </div>
              <div className="col-md-6">
                <strong>Formulation:</strong>
                <div>{selectedMedicine.formulation || '-'}</div>
              </div>
              <div className="col-md-6">
                <strong>Strength:</strong>
                <div>{selectedMedicine.strength || '-'}</div>
              </div>
              <div className="col-md-6">
                <strong>Primary Specialty:</strong>
                <div>{selectedMedicine.primary_specialty || '-'}</div>
              </div>
              <div className="col-md-6">
                <strong>Status:</strong>
                <div>
                  <span className={`badge bg-${selectedMedicine.isActive ? 'success' : 'danger'}`}>
                    {selectedMedicine.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {selectedMedicine.indications_symptoms && (
                <div className="col-12">
                  <strong>Indications:</strong>
                  <div className="text-muted small">{selectedMedicine.indications_symptoms}</div>
                </div>
              )}
              {selectedMedicine.benefits_summary && (
                <div className="col-12">
                  <strong>Benefits:</strong>
                  <div className="text-muted small">{selectedMedicine.benefits_summary}</div>
                </div>
              )}
              {selectedMedicine.common_side_effects?.length > 0 && (
                <div className="col-12">
                  <strong>Side Effects:</strong>
                  <div className="text-muted small">{selectedMedicine.common_side_effects.join(', ')}</div>
                </div>
              )}
              {selectedMedicine.storage_conditions && (
                <div className="col-12">
                  <strong>Storage Conditions:</strong>
                  <div className="text-muted small">{selectedMedicine.storage_conditions}</div>
                </div>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default MedicineMasterList
