import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CAlert,
  CSpinner,
  CProgressBar,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'

import { Upload, Download, ArrowLeft, CheckCircle, FileSpreadsheet } from 'lucide-react'

import { fileUpload } from '../../../Helpers'

const BulkUploadMedicines = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultDetails, setResultDetails] = useState(null)

  // CSV File Selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) return

    const fileName = selectedFile.name.toLowerCase()

    if (!fileName.endsWith('.csv')) {
      setError('Please select a valid CSV file (.csv)')
      setFile(null)
      e.target.value = ''
      return
    }

    if (selectedFile.size === 0) {
      setError('Selected CSV file is empty.')
      setFile(null)
      e.target.value = ''
      return
    }

    setFile(selectedFile)
    setError(null)
    setSuccess(null)
  }

  // Download CSV Template
  const downloadTemplate = () => {
    const headers = [
      'medicine_id',
      'generic_name',
      'mrp',
      'brand_names',
      'manufacturer',
      'medical_system',
      'strength',
      'formulation',
      'category',
      'company',
      'pack_size',
      'requires_prescription',
    ]

    const sampleData = [
      [
        'MED001',
        'Paracetamol',
        '30',
        'Dolo 650, Calpol',
        'ABC Pharma',
        'Allopathy',
        '650 mg',
        'Tablet',
        'Pain Relief',
        'ABC Pharma',
        '15 Tablets',
        'No',
      ],
      [
        'MED002',
        'Amoxicillin',
        '120',
        'Mox, Novamox',
        'XYZ Pharma',
        'Allopathy',
        '500 mg',
        'Capsule',
        'Antibiotic',
        'XYZ Pharma',
        '10 Capsules',
        'Yes',
      ],
    ]

    // Escape CSV values
    const escapeCSV = (value) => {
      const str = String(value ?? '')
      return `"${str.replace(/"/g, '""')}"`
    }

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...sampleData.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n')

    // Add UTF-8 BOM for Excel compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'Medicine_Master_Template.csv'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // Upload CSV
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
      const formData = new FormData()

      formData.append('file', file)

      const response = await fileUpload({
        url: '/superadmin/medicines/bulk-upload',
        cred: formData,
      })

      if (response.data?.success) {
        const data = response.data?.data || {}

        setUploadedCount(data.uploaded_count || 0)
        setTotalCount(data.total_count || 0)

        setResultDetails(data)
        setSuccess(response.data?.message || 'CSV uploaded successfully.')

        setShowResultModal(true)
        setFile(null)

        const fileInput = document.getElementById('file-input')

        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        setError(response.data?.message || 'Upload failed.')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'CSV upload failed.'

      const duplicateCount = err.response?.data?.data?.existing_count

      if (duplicateCount) {
        setError(`${errorMsg}. ${duplicateCount} medicines already exist in the system.`)
      } else {
        setError(errorMsg)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-3">
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          href="/medicine-master"
          className="d-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to List
        </CButton>
      </div>

      <CCard>
        <CCardHeader>
          <h5 className="mb-0">Bulk Upload Medicines</h5>
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

          <div className="row g-4">
            {/* Download Template */}
            <div className="col-md-6">
              <CCard className="h-100 bg-light">
                <CCardBody>
                  <h6 className="mb-3">
                    <Download size={18} className="me-2" />
                    Download CSV Template
                  </h6>

                  <p className="text-muted small mb-3">
                    Download the CSV template, fill in your medicine details and upload the
                    completed file.
                  </p>

                  <CButton
                    color="info"
                    variant="outline"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={downloadTemplate}
                  >
                    <Download size={16} />
                    Download CSV Template
                  </CButton>

                  <hr />

                  <h6 className="mb-3">Column Guide</h6>

                  <div className="small">
                    <p className="mb-2">
                      <strong>Required:</strong>
                    </p>

                    <ul className="mb-3">
                      <li>medicine_id - Unique medicine ID</li>
                      <li>generic_name - Generic drug name</li>
                      <li>mrp - Maximum Retail Price</li>
                    </ul>

                    <p className="mb-2">
                      <strong>Optional:</strong>
                    </p>

                    <ul>
                      <li>brand_names - Comma-separated brand names</li>
                      <li>manufacturer - Manufacturer name</li>
                      <li>medical_system - Allopathy, Ayurveda, etc.</li>
                      <li>strength - Medicine strength</li>
                      <li>formulation - Tablet, Capsule, Syrup, etc.</li>
                      <li>category - Medicine category</li>
                      <li>company - Company name</li>
                      <li>pack_size - Package size</li>
                      <li>requires_prescription - Yes / No</li>
                    </ul>
                  </div>
                </CCardBody>
              </CCard>
            </div>

            {/* Upload CSV */}
            <div className="col-md-6">
              <CCard className="h-100">
                <CCardBody>
                  <h6 className="mb-3">
                    <FileSpreadsheet size={18} className="me-2" />
                    Upload CSV File
                  </h6>

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

                    <div className="mb-3">
                      <small className="text-muted d-block">
                        Tip: Ensure all required columns are present. Duplicate medicine IDs will be
                        rejected.
                      </small>
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
                          Upload CSV File
                        </>
                      )}
                    </CButton>
                  </form>

                  {uploading && (
                    <div className="mt-3">
                      <CProgressBar value={33} animated striped />

                      <small className="text-muted">Processing your CSV file...</small>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </div>
          </div>
        </CCardBody>
      </CCard>

      {/* Upload Result Modal */}
      <CModal visible={showResultModal} onClose={() => setShowResultModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center gap-2">
            <CheckCircle size={24} className="text-success" />
            Upload Complete
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="bg-success bg-opacity-10 p-3 rounded">
                <div className="h4 text-success fw-bold mb-1">{uploadedCount}</div>

                <small className="text-muted">Medicines Uploaded</small>
              </div>
            </div>

            <div className="col-md-6">
              <div className="bg-info bg-opacity-10 p-3 rounded">
                <div className="h4 text-info fw-bold mb-1">{totalCount}</div>

                <small className="text-muted">Total Processed</small>
              </div>
            </div>
          </div>

          {resultDetails?.first_ids?.length > 0 && (
            <div>
              <h6 className="mb-2">First Uploaded Medicines:</h6>

              <ul className="list-group list-group-flush">
                {resultDetails.first_ids.map((id, idx) => (
                  <li key={idx} className="list-group-item py-2">
                    <strong>{id}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 text-end">
            <CButton color="success" onClick={() => setShowResultModal(false)}>
              Done
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </div>
  )
}

export default BulkUploadMedicines
