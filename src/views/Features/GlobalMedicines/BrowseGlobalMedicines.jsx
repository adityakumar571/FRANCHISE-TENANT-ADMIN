import React, { useState, useEffect } from 'react'
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CButton, CInputGroup, CFormInput, CCard, CCardBody, CCardHeader, CSpinner,
  CPagination, CPaginationItem, CAlert, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CFormSelect, CRow, CCol
} from '@coreui/react'
import { Search, Plus, Eye, Download, Check } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'

const BrowseGlobalMedicines = () => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [imported, setImported] = useState(0)

  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const [importLoading, setImportLoading] = useState(false)
  const [customMrp, setCustomMrp] = useState('')
  const [counterId, setCounterId] = useState('')

  useEffect(() => {
    fetchGlobalMedicines()
  }, [currentPage, searchTerm])

  const fetchGlobalMedicines = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getRequest(
        `/franchise/medicines/global-available?search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
      )

      if (response.data?.success) {
        setMedicines(response.data?.data?.medicines || [])
        setTotal(response.data?.data?.total || 0)
        setImported(response.data?.data?.imported || 0)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch global medicines')
    } finally {
      setLoading(false)
    }
  }

  const handleImportClick = (medicine) => {
    setSelectedMedicine(medicine)
    setCustomMrp(medicine.mrp)
    setCounterId('')
    setShowImportModal(true)
  }

  const handleImport = async () => {
    if (!selectedMedicine) return

    setImportLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await postRequest({
        url: `/franchise/medicines/import-global/${selectedMedicine.globalId}`,
        cred: {
          counterId: counterId || undefined,
          customMrp: customMrp ? Number(customMrp) : undefined
        }
      })

      if (response.data?.success) {
        setSuccess(`${selectedMedicine.generic_name} imported successfully!`)
        setShowImportModal(false)
        setSelectedMedicine(null)
        
        // Refresh list
        setTimeout(() => {
          fetchGlobalMedicines()
        }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed')
    } finally {
      setImportLoading(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Global Medicines Catalog</h5>
            <small className="text-muted">
              {imported} imported • {total} available
            </small>
          </div>
          <CButton
            color="primary"
            size="sm"
            href="/global-medicines/bulk-import"
            className="d-flex align-items-center gap-2"
          >
            <Plus size={16} /> Bulk Import
          </CButton>
        </CCardHeader>

        <CCardBody>
          {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
          {success && <CAlert color="success" className="mb-3">{success}</CAlert>}

          <CInputGroup className="mb-3">
            <CFormInput
              placeholder="Search by medicine name, generic name, or manufacturer..."
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
            <CAlert color="warning">No global medicines found</CAlert>
          ) : (
            <>
              <div className="table-responsive">
                <CTable hover striped>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Generic Name</CTableHeaderCell>
                      <CTableHeaderCell>Brand Names</CTableHeaderCell>
                      <CTableHeaderCell>Manufacturer</CTableHeaderCell>
                      <CTableHeaderCell>System</CTableHeaderCell>
                      <CTableHeaderCell>MRP</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {medicines.map((medicine) => (
                      <CTableRow key={medicine.globalId}>
                        <CTableDataCell className="fw-bold">
                          {medicine.generic_name}
                        </CTableDataCell>
                        <CTableDataCell>
                          {medicine.brand_names?.join(', ') || '-'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {medicine.manufacturer || '-'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <span className="badge bg-info">
                            {medicine.medical_system || 'N/A'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="fw-bold">
                          ₹{medicine.mrp}
                        </CTableDataCell>
                        <CTableDataCell>
                          {medicine.isImported ? (
                            <span className="badge bg-success d-flex align-items-center gap-1 w-fit">
                              <Check size={14} /> Imported
                            </span>
                          ) : (
                            <span className="badge bg-secondary">Available</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CButton
                              color="info"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMedicine(medicine)
                                setShowDetailsModal(true)
                              }}
                            >
                              <Eye size={14} />
                            </CButton>
                            {!medicine.isImported && (
                              <CButton
                                color="success"
                                size="sm"
                                onClick={() => handleImportClick(medicine)}
                              >
                                <Plus size={14} /> Import
                              </CButton>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {totalPages > 1 && (
                <CPagination className="justify-content-end mt-3">
                  <CPaginationItem
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </CPaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <CPaginationItem
                      key={i + 1}
                      active={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Details Modal */}
      <CModal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Medicine Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedMedicine && (
            <div className="row g-3">
              <div className="col-md-6">
                <strong>Generic Name:</strong> {selectedMedicine.generic_name}
              </div>
              <div className="col-md-6">
                <strong>Brand Names:</strong> {selectedMedicine.brand_names?.join(', ') || '-'}
              </div>
              <div className="col-md-6">
                <strong>Manufacturer:</strong> {selectedMedicine.manufacturer || '-'}
              </div>
              <div className="col-md-6">
                <strong>Medical System:</strong> {selectedMedicine.medical_system || '-'}
              </div>
              <div className="col-md-6">
                <strong>Primary Specialty:</strong> {selectedMedicine.primary_specialty || '-'}
              </div>
              <div className="col-md-6">
                <strong>MRP:</strong> ₹{selectedMedicine.mrp}
              </div>
              <div className="col-md-6">
                <strong>Dosage (Adult):</strong> {selectedMedicine.dosage_adult || '-'}
              </div>
              <div className="col-12">
                <strong>Indications:</strong> {selectedMedicine.indications_symptoms || '-'}
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Import Modal */}
      <CModal visible={showImportModal} onClose={() => setShowImportModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Import Medicine</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedMedicine && (
            <CRow className="g-3">
              <CCol md={12}>
                <div className="bg-light p-3 rounded mb-3">
                  <h6 className="mb-2">{selectedMedicine.generic_name}</h6>
                  <p className="mb-1 text-muted">
                    Brands: {selectedMedicine.brand_names?.join(', ') || '-'}
                  </p>
                  <p className="mb-0 text-muted">
                    Manufacturer: {selectedMedicine.manufacturer || '-'}
                  </p>
                </div>
              </CCol>

              <CCol md={6}>
                <label className="form-label">Global MRP</label>
                <CFormInput
                  type="number"
                  value={selectedMedicine.mrp}
                  disabled
                  className="bg-light"
                />
              </CCol>

              <CCol md={6}>
                <label className="form-label">Your MRP (Optional)</label>
                <CFormInput
                  type="number"
                  placeholder={selectedMedicine.mrp}
                  value={customMrp}
                  onChange={(e) => setCustomMrp(e.target.value)}
                />
              </CCol>

              <CCol md={12}>
                <label className="form-label">Assign to Counter (Optional)</label>
                <CFormSelect
                  value={counterId}
                  onChange={(e) => setCounterId(e.target.value)}
                >
                  <option value="">Select counter...</option>
                  <option value="default">Default Counter</option>
                </CFormSelect>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setShowImportModal(false)}
            disabled={importLoading}
          >
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleImport}
            disabled={importLoading}
          >
            {importLoading ? <CSpinner size="sm" className="me-2" /> : null}
            {importLoading ? 'Importing...' : 'Import Medicine'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default BrowseGlobalMedicines
