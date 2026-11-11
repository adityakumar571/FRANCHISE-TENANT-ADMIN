import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard, CCardBody, CCardHeader, CForm, CFormLabel, CFormInput, CFormSelect,
  CButton, CSpinner, CAlert, CRow, CCol, CFormCheck, CFormTextarea
} from '@coreui/react'
import { ArrowLeft, Save } from 'lucide-react'
import { getRequest, postRequest, putRequest } from '../../../Helpers'

const MedicineMasterForm = ({ isEdit = false }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [formData, setFormData] = useState({
    medicine_id: '',
    generic_name: '',
    brand_names: '',
    manufacturer: '',
    medical_system: 'Allopathy',
    primary_specialty: '',
    secondary_specialties: '',
    patient_conditions: '',
    sub_category: '',
    formulation: 'Tablet',
    strength: '',
    pack_size: '',
    mrp: '',
    prescription_required: false,
    indications_symptoms: '',
    benefits_summary: '',
    common_side_effects: '',
    contraindications: '',
    drug_interactions: '',
    dosage_adult: '',
    dosage_pediatric: '',
    pregnancy_category: '',
    storage_conditions: '',
    expiry_months: '',
    vet_safe: false,
    keywords_synonyms: '',
    regulatory_status: 'Approved',
    notes: '',
  })

  useEffect(() => {
    if (isEdit && id) {
      fetchMedicine()
    }
  }, [id, isEdit])

  const fetchMedicine = async () => {
    try {
      const response = await getRequest(`/superadmin/medicines/${id}`)

      if (response.data?.success) {
        const med = response.data?.data
        setFormData({
          medicine_id: med.medicine_id || '',
          generic_name: med.generic_name || '',
          brand_names: med.brand_names?.join(', ') || '',
          manufacturer: med.manufacturer || '',
          medical_system: med.medical_system || 'Allopathy',
          primary_specialty: med.primary_specialty || '',
          secondary_specialties: med.secondary_specialties?.join(', ') || '',
          patient_conditions: med.patient_conditions?.join(', ') || '',
          sub_category: med.sub_category || '',
          formulation: med.formulation || 'Tablet',
          strength: med.strength || '',
          pack_size: med.packSize || '',
          mrp: med.mrp || '',
          prescription_required: med.prescription_required || med.requiresPrescription || false,
          indications_symptoms: med.indications_symptoms || '',
          benefits_summary: med.benefits_summary || '',
          common_side_effects: med.common_side_effects?.join(', ') || '',
          contraindications: med.contraindications?.join(', ') || '',
          drug_interactions: med.drug_interactions?.join(', ') || '',
          dosage_adult: med.dosage_adult || '',
          dosage_pediatric: med.dosage_pediatric || '',
          pregnancy_category: med.pregnancy_category || '',
          storage_conditions: med.storage_conditions || '',
          expiry_months: med.expiry_months || '',
          vet_safe: med.vet_safe || false,
          keywords_synonyms: med.keywords_synonyms?.join(', ') || '',
          regulatory_status: med.regulatory_status || 'Approved',
          notes: med.notes || '',
        })
        setError(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch medicine')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (!formData.generic_name || !formData.mrp) {
        setError('generic_name and mrp are required')
        setSubmitting(false)
        return
      }

      const submitData = {
        ...formData,
        brand_names: formData.brand_names.split(',').map(s => s.trim()).filter(Boolean),
        secondary_specialties: formData.secondary_specialties.split(',').map(s => s.trim()).filter(Boolean),
        patient_conditions: formData.patient_conditions.split(',').map(s => s.trim()).filter(Boolean),
        common_side_effects: formData.common_side_effects.split(',').map(s => s.trim()).filter(Boolean),
        contraindications: formData.contraindications.split(',').map(s => s.trim()).filter(Boolean),
        drug_interactions: formData.drug_interactions.split(',').map(s => s.trim()).filter(Boolean),
        keywords_synonyms: formData.keywords_synonyms.split(',').map(s => s.trim()).filter(Boolean),
        mrp: Number(formData.mrp),
        expiry_months: formData.expiry_months ? Number(formData.expiry_months) : undefined,
      }

      let response
      if (isEdit) {
        response = await putRequest({
          url: `/superadmin/medicines/${id}`,
          cred: submitData
        })
      } else {
        response = await postRequest({
          url: '/superadmin/medicines',
          cred: submitData
        })
      }

      setSuccess(`Medicine ${isEdit ? 'updated' : 'created'} successfully!`)
      setTimeout(() => {
        navigate('/medicine-master')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} medicine`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() => navigate('/medicine-master')}
          className="d-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to List
        </CButton>
      </div>

      <CCard>
        <CCardHeader>
          <h5 className="mb-0">{isEdit ? 'Edit' : 'Add New'} Medicine Master</h5>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}
          {success && <CAlert color="success" className="mb-3">{success}</CAlert>}

          <CForm onSubmit={handleSubmit}>
            {/* ── Basic Information ── */}
            <h6 className="mt-4 mb-3 fw-bold">Basic Information</h6>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Medicine ID</CFormLabel>
                <CFormInput
                  name="medicine_id"
                  value={formData.medicine_id}
                  onChange={handleChange}
                  placeholder="e.g., MED2000001"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Generic Name *</CFormLabel>
                <CFormInput
                  name="generic_name"
                  value={formData.generic_name}
                  onChange={handleChange}
                  placeholder="e.g., Ibuprofen"
                  required
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Brand Names (comma-separated)</CFormLabel>
                <CFormInput
                  name="brand_names"
                  value={formData.brand_names}
                  onChange={handleChange}
                  placeholder="e.g., IbuprofenPlus, IbuprofenMax"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Manufacturer</CFormLabel>
                <CFormInput
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., Indian Pharma Company"
                />
              </CCol>
            </CRow>

            {/* ── Classification ── */}
            <h6 className="mt-4 mb-3 fw-bold">Classification</h6>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Medical System</CFormLabel>
                <CFormSelect
                  name="medical_system"
                  value={formData.medical_system}
                  onChange={handleChange}
                >
                  <option>Allopathy</option>
                  <option>Ayurveda</option>
                  <option>Homeopathy</option>
                  <option>Unani</option>
                  <option>Siddha</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Primary Specialty</CFormLabel>
                <CFormInput
                  name="primary_specialty"
                  value={formData.primary_specialty}
                  onChange={handleChange}
                  placeholder="e.g., Cardiology"
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Secondary Specialties (comma-separated)</CFormLabel>
                <CFormInput
                  name="secondary_specialties"
                  value={formData.secondary_specialties}
                  onChange={handleChange}
                  placeholder="e.g., General Medicine, Neurology"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Patient Conditions (comma-separated)</CFormLabel>
                <CFormInput
                  name="patient_conditions"
                  value={formData.patient_conditions}
                  onChange={handleChange}
                  placeholder="e.g., Hypertension, Pain Relief"
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={12}>
                <CFormLabel>Sub Category</CFormLabel>
                <CFormInput
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleChange}
                  placeholder="e.g., Pain Reliever"
                />
              </CCol>
            </CRow>

            {/* ── Product Details ── */}
            <h6 className="mt-4 mb-3 fw-bold">Product Details</h6>
            <CRow className="g-3 mb-3">
              <CCol md={3}>
                <CFormLabel>Formulation</CFormLabel>
                <CFormSelect
                  name="formulation"
                  value={formData.formulation}
                  onChange={handleChange}
                >
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Syrup</option>
                  <option>Injection</option>
                  <option>Drops</option>
                  <option>Cream</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Strength</CFormLabel>
                <CFormInput
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                  placeholder="e.g., 500 mg"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Pack Size</CFormLabel>
                <CFormInput
                  name="pack_size"
                  value={formData.pack_size}
                  onChange={handleChange}
                  placeholder="e.g., 10 tablets"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>MRP (₹) *</CFormLabel>
                <CFormInput
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  placeholder="70"
                  required
                />
              </CCol>
            </CRow>

            {/* ── Clinical Information ── */}
            <h6 className="mt-4 mb-3 fw-bold">Clinical Information</h6>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Indications/Symptoms</CFormLabel>
                <CFormTextarea
                  name="indications_symptoms"
                  value={formData.indications_symptoms}
                  onChange={handleChange}
                  placeholder="e.g., Hypertension"
                  rows="2"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Benefits Summary</CFormLabel>
                <CFormTextarea
                  name="benefits_summary"
                  value={formData.benefits_summary}
                  onChange={handleChange}
                  placeholder="e.g., Used for hypertension"
                  rows="2"
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Common Side Effects (comma-separated)</CFormLabel>
                <CFormInput
                  name="common_side_effects"
                  value={formData.common_side_effects}
                  onChange={handleChange}
                  placeholder="e.g., Mild nausea, Headache"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Contraindications (comma-separated)</CFormLabel>
                <CFormInput
                  name="contraindications"
                  value={formData.contraindications}
                  onChange={handleChange}
                  placeholder="e.g., Known allergy"
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={12}>
                <CFormLabel>Drug Interactions (comma-separated)</CFormLabel>
                <CFormInput
                  name="drug_interactions"
                  value={formData.drug_interactions}
                  onChange={handleChange}
                  placeholder="e.g., Warfarin, Aspirin"
                />
              </CCol>
            </CRow>

            {/* ── Dosage Information ── */}
            <h6 className="mt-4 mb-3 fw-bold">Dosage Information</h6>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Dosage (Adult)</CFormLabel>
                <CFormInput
                  name="dosage_adult"
                  value={formData.dosage_adult}
                  onChange={handleChange}
                  placeholder="e.g., As prescribed"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Dosage (Pediatric)</CFormLabel>
                <CFormInput
                  name="dosage_pediatric"
                  value={formData.dosage_pediatric}
                  onChange={handleChange}
                  placeholder="e.g., As per age"
                />
              </CCol>
            </CRow>

            {/* ── Safety & Storage ── */}
            <h6 className="mt-4 mb-3 fw-bold">Safety & Storage</h6>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Pregnancy Category</CFormLabel>
                <CFormSelect
                  name="pregnancy_category"
                  value={formData.pregnancy_category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                  <option>X</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Storage Conditions</CFormLabel>
                <CFormInput
                  name="storage_conditions"
                  value={formData.storage_conditions}
                  onChange={handleChange}
                  placeholder="e.g., Store below 25°C"
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Expiry (Months)</CFormLabel>
                <CFormInput
                  type="number"
                  name="expiry_months"
                  value={formData.expiry_months}
                  onChange={handleChange}
                  placeholder="24"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Regulatory Status</CFormLabel>
                <CFormSelect
                  name="regulatory_status"
                  value={formData.regulatory_status}
                  onChange={handleChange}
                >
                  <option>Approved</option>
                  <option>Under Review</option>
                  <option>Banned</option>
                </CFormSelect>
              </CCol>
            </CRow>

            {/* ── Additional Details ── */}
            <h6 className="mt-4 mb-3 fw-bold">Additional Details</h6>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormCheck
                  type="checkbox"
                  name="prescription_required"
                  label="Prescription Required"
                  checked={formData.prescription_required}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormCheck
                  type="checkbox"
                  name="vet_safe"
                  label="Veterinary Safe"
                  checked={formData.vet_safe}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={12}>
                <CFormLabel>Keywords/Synonyms (comma-separated)</CFormLabel>
                <CFormInput
                  name="keywords_synonyms"
                  value={formData.keywords_synonyms}
                  onChange={handleChange}
                  placeholder="e.g., ibuprofen, hypertension, pain"
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={12}>
                <CFormLabel>Notes</CFormLabel>
                <CFormTextarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes"
                  rows="3"
                />
              </CCol>
            </CRow>

            {/* ── Buttons ── */}
            <div className="d-flex gap-2 mt-4">
              <CButton
                color="primary"
                type="submit"
                disabled={submitting}
                className="d-flex align-items-center gap-2"
              >
                {submitting ? <CSpinner size="sm" /> : <Save size={16} />}
                {submitting ? 'Saving...' : 'Save Medicine'}
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => navigate('/medicine-master')}
              >
                Cancel
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default MedicineMasterForm
