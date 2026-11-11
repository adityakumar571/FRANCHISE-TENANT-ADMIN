import React, { useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton, CAlert, CSpinner, CRow, CCol,
  CModal, CModalHeader, CModalTitle, CModalBody, CFormInput
} from '@coreui/react'
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { postRequest } from '../../../Helpers'

const BulkImportGlobalMedicines = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultDetails, setResultDetails] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file (.csv)')
        setFile(null)
      } else {
        setFile(selectedFile)
        setError(null)
      }
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'globalMedicineId',
      'customMrp',
      'notes'
    ]

    const sampleData = [
      [
        '507f1f77bcf86cd799439011',  // Global medicine ID from MongoDB
        '75',                         // Custom MRP (optional)
        'Import for counter 1'
      ],
      [
        '507f1f77bcf86cd799439012',
        '120',
        'Antibiotic stock'
      ]
    ]

    const escapeCSV = (value) => {
      const str = String(value ?? '')
      return `"${str.replace(/"/g, '""')}"`
    }

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...sampleData.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'BulkImportMedicines_Template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a CSV file to upload.')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Parse CSV
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      const rows = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        if (values[0]) {  // Skip empty rows
          rows.push({
            globalMedicineId: values[0],
            customMrp: values[1] ? Number(values[1]) : undefined,
            notes: values[2]
          })
        }
      }

      if (rows.length === 0) {
        setError('CSV file is empty or invalid')
        return
      }

      // Build request
      const customPricing = {}
      rows.forEach(row => {
        if (row.customMrp) {
          customPricing[row.globalMedicineId] = row.customMrp
        }
      })

      const response = await postRequest({
        url: '/franchise/medicines/bulk-import-global',
        cred: {
          globalMedicineIds: rows.map(r => r.globalMedicineId),
          customPricing
        }
      })

      if (response.data?.success) {
        const data = response.data?.data || {}
        setResultDetails(data)
        setSuccess(`${data.imported} medicines imported successfully!`)
        setShowResultModal(true)
        setFile(null)

        const fileInput = document.getElementById('file-input')
        if (fileInput) fileInput.value = ''
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          href="/global-medicines"
          className="d-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Browse
        </CButton>
      </div>

      <CCard>
        <CCardHeader>
          <h5 className="mb-0">Bulk Import Global Medicines</h5>
        </CCardHeader>

        <CCardBody>
          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}

          {success && (
            <CAlert color="success" className="mb-3">
              {success}
            </CAlert>
          )}

          <CRow className="g-4">
            {/* Template Section */}
            <CCol md={6}>
              <CCard className="h-100 bg-light">
                <CCardBody>
                  <h6 className="mb-3">📥 Download Template</h6>
                  <p className="text-muted small mb-3">
                    Download the CSV template, fill in your global medicine IDs, and upload.
                  </p>
                  <CButton
                    color="info"
                    variant="outline"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={downloadTemplate}
                  >
                    <Upload size={16} /> Download Template
                  </CButton>

                  <hr />

                  <h6 className="mb-3">Column Guide</h6>
                  <div className="small">
                    <p className="mb-2">
                      <strong>Required:</strong>
                    </p>
                    <ul className="mb-3">
                      <li>globalMedicineId - MongoDB ID from global medicine</li>
                    </ul>

                    <p className="mb-2">
                      <strong>Optional:</strong>
                    </p>
                    <ul>
                      <li>customMrp - Override the global MRP for your pharmacy</li>
                      <li>notes - Internal notes about the import</li>
                    </ul>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Upload Section */}
            <CCol md={6}>
              <CCard className="h-100">
                <CCardBody>
                  <h6 className="mb-3">📤 Upload CSV File</h6>

                  <form onSubmit={handleUpload}>
                    <div className="mb-3">
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="d-none"
                        id="file-input"
                      />

                      <label
                        htmlFor="file-input"
                        className="p-4 border border-2 border-dashed rounded-2 text-center bg-light d-block"
                        style={{
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          minHeight: '180px',
                        }}
                      >
                        <Upload size={36} className="mx-auto mb-3 text-primary" />
                        <p className="mb-1 fw-semibold">
                          {file ? file.name : 'Click to select or drag CSV file'}
                        </p>
                        <small className="text-muted">Supported format: .csv</small>

                        {file && (
                          <div className="mt-2">
                            <small className="text-success">
                              <CheckCircle size={14} className="me-1" />
                              File selected successfully
                            </small>
                          </div>
                        )}
                      </label>
                    </div>

                    <CButton
                      color="primary"
                      type="submit"
                      disabled={!file || uploading}
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <CSpinner size="sm" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Import Medicines
                        </>
                      )}
                    </CButton>
                  </form>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Result Modal */}
      <CModal visible={showResultModal} onClose={() => setShowResultModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center gap-2">
            <CheckCircle size={24} className="text-success" />
            Import Complete
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CRow className="g-3 mb-4">
            <CCol md={6}>
              <div className="bg-success bg-opacity-10 p-3 rounded">
                <div className="h4 text-success fw-bold mb-1">
                  {resultDetails?.imported || 0}
                </div>
                <small className="text-muted">Medicines Imported</small>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="bg-danger bg-opacity-10 p-3 rounded">
                <div className="h4 text-danger fw-bold mb-1">
                  {resultDetails?.failed || 0}
                </div>
                <small className="text-muted">Failed</small>
              </div>
            </CCol>
          </CRow>

          {resultDetails?.errors?.length > 0 && (
            <div className="mt-3">
              <h6 className="mb-2 text-danger">
                <AlertCircle size={16} className="me-2" />
                Errors:
              </h6>
              <div className="list-group list-group-sm">
                {resultDetails.errors.map((err, idx) => (
                  <div key={idx} className="list-group-item">
                    <small>
                      <strong>{err.globalMedId}</strong>: {err.error}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}

export default BulkImportGlobalMedicines
