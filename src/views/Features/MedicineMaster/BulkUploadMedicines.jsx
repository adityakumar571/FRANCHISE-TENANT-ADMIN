import React, { useState, useRef } from 'react'
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

import { Upload, Download, ArrowLeft, CheckCircle, FileSpreadsheet, AlertCircle } from 'lucide-react'

const BulkUploadMedicines = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0 })
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultDetails, setResultDetails] = useState(null)
  const fileInputRef = useRef(null)

  // File Selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const fileName = selectedFile.name.toLowerCase()
    const isValidFile = fileName.endsWith('.csv') || 
                        fileName.endsWith('.xlsx') || 
                        fileName.endsWith('.xls')

    if (!isValidFile) {
      setError('Please select a valid file (.csv, .xlsx, or .xls)')
      setFile(null)
      e.target.value = ''
      return
    }

    if (selectedFile.size === 0) {
      setError('Selected file is empty.')
      setFile(null)
      e.target.value = ''
      return
    }

    const maxSize = 100 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 100MB limit.')
      setFile(null)
      e.target.value = ''
      return
    }

    setFile(selectedFile)
    setError(null)
    setSuccess(null)
  }

  // Download Template
  const downloadTemplate = () => {
    import('xlsx').then((XLSX) => {
      const sampleData = [
        {
          medicine_id: 'MED001',
          generic_name: 'Paracetamol',
          mrp: 30,
          brand_names: 'Dolo 650, Calpol',
          manufacturer: 'ABC Pharma',
          medical_system: 'Allopathy',
          strength: '650 mg',
          formulation: 'Tablet',
          sub_category: 'Pain Relief',
          expiry_months: 36,
          prescription_required: 'No',
        },
        {
          medicine_id: 'MED002',
          generic_name: 'Amoxicillin',
          mrp: 120,
          brand_names: 'Mox, Novamox',
          manufacturer: 'XYZ Pharma',
          medical_system: 'Allopathy',
          strength: '500 mg',
          formulation: 'Capsule',
          sub_category: 'Antibiotic',
          expiry_months: 24,
          prescription_required: 'Yes',
        },
      ]

      const worksheet = XLSX.utils.json_to_sheet(sampleData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines')

      worksheet['!cols'] = [
        { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 30 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
      ]

      XLSX.writeFile(workbook, 'Medicine_Master_Template.xlsx')
    })
  }

  // Chunked Upload
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(null)

    try {
      const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      let uploadedBytes = 0

      console.log(`📤 Starting chunked upload: ${totalChunks} chunks of 5MB each`)

      // Try to get token from localStorage or use empty (browser will send cookies automatically)
      const token = localStorage.getItem('SA_TOKEN') || 
                    localStorage.getItem('accessToken') || 
                    localStorage.getItem('LMS')

      // Upload each chunk
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        setChunkProgress({
          current: chunkIndex + 1,
          total: totalChunks,
        })

        const formData = new FormData()
        formData.append('file', chunk)
        formData.append('chunkIndex', chunkIndex)
        formData.append('totalChunks', totalChunks)
        formData.append('fileName', file.name)

        try {
          const headers = {}
          // Add Authorization header only if token exists
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
          
          const response = await fetch('/api/superadmin/medicines/bulk-upload-chunk', {
            method: 'POST',
            headers,
            credentials: 'include', // CRITICAL: Send cookies automatically
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || `Chunk ${chunkIndex + 1} upload failed`)
          }

          uploadedBytes += (end - start)
          const progressPercent = Math.min(99, Math.round((uploadedBytes / file.size) * 100))
          setUploadProgress(progressPercent)

          console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} (${progressPercent}%)`)
        } catch (chunkError) {
          console.error(`❌ Chunk ${chunkIndex + 1}:`, chunkError)
          setError(`Upload failed at chunk ${chunkIndex + 1}: ${chunkError.message}`)
          setUploading(false)
          return
        }

        if (chunkIndex < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      console.log('🔄 Finalizing...')
      setUploadProgress(95)

      try {
        const headers = {
          'Content-Type': 'application/json',
        }
        // Add Authorization header only if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const finalResponse = await fetch('/api/superadmin/medicines/bulk-upload-finalize', {
          method: 'POST',
          headers,
          credentials: 'include', // CRITICAL: Send cookies automatically
          body: JSON.stringify({ fileName: file.name }),
        })

        if (!finalResponse.ok) {
          const errorData = await finalResponse.json()
          throw new Error(errorData.message || 'Finalization failed')
        }

        const result = await finalResponse.json()
        const data = result.data || {}

        setUploadedCount(data.uploaded_count || 0)
        setTotalCount(data.total_count || 0)
        setResultDetails(data)
        setSuccess(result.message || 'File processed successfully.')
        setShowResultModal(true)
        setFile(null)

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        setUploadProgress(100)
        setTimeout(() => setUploadProgress(0), 2000)
      } catch (finalError) {
        console.error('❌ Finalization:', finalError)
        setError(finalError.message || 'Finalization failed')
      }
    } catch (err) {
      console.error('❌ Upload:', err)
      setError(err.message || 'Upload failed.')
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
          href="/medicine-master"
          className="d-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to List
        </CButton>
      </div>

      <CCard>
        <CCardHeader>
          <h5 className="mb-0">Bulk Upload Medicines (Chunked)</h5>
        </CCardHeader>

        <CCardBody>
          {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
          {success && <CAlert color="success" className="mb-3">{success}</CAlert>}

          <div className="row g-4">
            {/* Template */}
            <div className="col-md-6">
              <CCard className="h-100 bg-light">
                <CCardBody>
                  <h6 className="mb-3">
                    <Download size={18} className="me-2" />
                    Download Excel Template
                  </h6>

                  <p className="text-muted small mb-3">
                    Download template, fill with medicine details, upload completed file.
                  </p>

                  <CButton
                    color="info"
                    variant="outline"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={downloadTemplate}
                  >
                    <Download size={16} />
                    Download Excel Template
                  </CButton>

                  <hr />

                  <h6 className="mb-3">Required Columns</h6>
                  <div className="small">
                    <ul className="mb-3">
                      <li><strong>generic_name</strong> - Drug name (required)</li>
                      <li><strong>mrp</strong> - Price (required)</li>
                      <li><strong>medicine_id</strong> - Unique ID (optional)</li>
                    </ul>

                    <p className="mb-2"><strong>Optional:</strong></p>
                    <ul>
                      <li>brand_names, manufacturer, medical_system</li>
                      <li>strength, formulation, sub_category</li>
                      <li>expiry_months, prescription_required</li>
                    </ul>
                  </div>
                </CCardBody>
              </CCard>
            </div>

            {/* Upload */}
            <div className="col-md-6">
              <CCard className="h-100">
                <CCardBody>
                  <h6 className="mb-3">
                    <FileSpreadsheet size={18} className="me-2" />
                    Upload File (Chunked)
                  </h6>

                  <form onSubmit={handleUpload}>
                    <div className="mb-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="d-none"
                      />

                      <label
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 border border-2 border-dashed rounded-2 text-center bg-light d-block"
                        style={{
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          minHeight: '180px',
                          opacity: uploading ? 0.6 : 1,
                        }}
                      >
                        <Upload size={36} className="mx-auto mb-3 text-primary" />
                        <p className="mb-1 fw-semibold">
                          {file ? file.name : 'Click to select or drag file'}
                        </p>
                        <small className="text-muted">
                          .xlsx, .xls, .csv (Max 100MB)
                        </small>

                        {file && (
                          <div className="mt-2">
                            <small className="text-success">
                              <CheckCircle size={14} className="me-1" />
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </small>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block">
                        ✓ 5MB chunk uploads
                        <br />
                        ✓ Up to 2 lakh records
                        <br />
                        ✓ Auto duplicate skip
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
                          {Math.round(uploadProgress)}%
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Upload File
                        </>
                      )}
                    </CButton>
                  </form>

                  {uploading && (
                    <div className="mt-3">
                      <CProgressBar 
                        value={uploadProgress} 
                        animated 
                        striped 
                        color="info"
                        style={{ height: '24px' }}
                      />
                      <small className="text-muted d-block mt-2 text-center">
                        {chunkProgress.total > 0 ? (
                          <>Chunk {chunkProgress.current}/{chunkProgress.total} • {Math.round(uploadProgress)}%</>
                        ) : (
                          <>Processing {Math.round(uploadProgress)}%</>
                        )}
                      </small>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </div>
          </div>
        </CCardBody>
      </CCard>

      {/* Result Modal */}
      <CModal visible={showResultModal} onClose={() => setShowResultModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center gap-2">
            <CheckCircle size={24} className="text-success" />
            Upload Summary
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="bg-success bg-opacity-10 p-3 rounded">
                <div className="h4 text-success fw-bold mb-1">
                  {resultDetails?.uploaded_count || 0}
                </div>
                <small className="text-muted">Medicines Uploaded</small>
              </div>
            </div>

            <div className="col-md-6">
              <div className="bg-info bg-opacity-10 p-3 rounded">
                <div className="h4 text-info fw-bold mb-1">
                  {resultDetails?.total_count || 0}
                </div>
                <small className="text-muted">Total Processed</small>
              </div>
            </div>
          </div>

          {resultDetails?.validation_skipped_count > 0 && (
            <CAlert color="warning" className="mb-3">
              <AlertCircle size={16} className="me-2" />
              <strong>{resultDetails.validation_skipped_count} skipped:</strong> Invalid data
            </CAlert>
          )}

          {resultDetails?.skipped_details?.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-2">Sample Skipped (first 10):</h6>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <ul className="list-group list-group-flush small">
                  {resultDetails.skipped_details.map((row, idx) => (
                    <li key={idx} className="list-group-item py-2">
                      <strong>Row {row.row}:</strong> {row.reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-4 text-end">
            <CButton 
              color="success" 
              onClick={() => {
                setShowResultModal(false)
                window.location.href = '/medicine-master'
              }}
            >
              Done & Back to List
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </div>
  )
}

export default BulkUploadMedicines
