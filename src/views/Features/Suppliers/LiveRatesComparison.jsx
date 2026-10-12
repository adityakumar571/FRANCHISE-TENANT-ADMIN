import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CBadge,
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CFormTextarea,
  CFormLabel,
  CListGroup,
  CListGroupItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilPhone,
  cilEnvelopeClosed,
  cilCart,
  cilStar,
  cilCheckCircle,
  cilTrendingUp,
  cilWarning,
  cilInfo
} from '@coreui/icons'
import axios from 'axios'
import { toast } from 'react-toastify'

const LiveRatesComparison = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [comparisonData, setComparisonData] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderNotes, setOrderNotes] = useState('')
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchingMedicines, setSearchingMedicines] = useState(false)

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'

  // Autocomplete search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchMasterMedicines(searchTerm)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Search master medicines for autocomplete
  const searchMasterMedicines = async (query) => {
    setSearchingMedicines(true)
    try {
      const response = await axios.get(
        `${API_URL}/api/master-medicines/search?q=${encodeURIComponent(query)}`
      )

      if (response.data.status) {
        setSuggestions(response.data.data || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Master medicine search error:', error)
      setSuggestions([])
    } finally {
      setSearchingMedicines(false)
    }
  }

  // Handle selecting a medicine from autocomplete
  const handleSelectMedicine = (medicine) => {
    setSearchTerm(medicine.genericName)
    setShowSuggestions(false)
    // Auto-search after selection
    setTimeout(() => handleSearch(medicine.genericName), 100)
  }

  // Search for medicine comparison
  const handleSearch = async (medicineNameParam = null) => {
    const medicineToSearch = medicineNameParam || searchTerm
    
    if (!medicineToSearch.trim()) {
      toast.warning('Please enter a medicine name to search')
      return
    }

    setLoading(true)
    setSearchQuery(medicineToSearch)

    try {
      const response = await axios.get(
        `${API_URL}/api/franchise-suppliers/medicines/compare/${encodeURIComponent(medicineToSearch)}`,
        {
          withCredentials: true,
        }
      )

      if (response.data.status) {
        setComparisonData(response.data.data)
        if (response.data.data.suppliers.length === 0) {
          toast.info('No suppliers found for this medicine')
        }
      } else {
        toast.error(response.data.message || 'Failed to fetch comparison data')
        setComparisonData(null)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error.response?.data?.message || 'Failed to search medicine')
      setComparisonData(null)
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key in search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Render star rating
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <CIcon key={`star-${i}`} icon={cilStar} size="sm" style={{ color: '#FFD700' }} />
      )
    }
    if (hasHalfStar) {
      stars.push(
        <CIcon key="star-half" icon={cilStar} size="sm" style={{ color: '#FFD700', opacity: 0.5 }} />
      )
    }
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <CIcon key={`star-empty-${i}`} icon={cilStar} size="sm" style={{ color: '#ccc' }} />
      )
    }

    return (
      <div className="d-flex align-items-center gap-1">
        {stars}
        <span className="ms-1 text-muted" style={{ fontSize: '0.875rem' }}>
          ({rating.toFixed(1)})
        </span>
      </div>
    )
  }

  // Handle Buy Now
  const handleBuyNow = (supplier) => {
    setSelectedSupplier(supplier)
    setShowOrderModal(true)
  }

  // Submit order
  const handleSubmitOrder = () => {
    if (!orderQuantity || orderQuantity < 1) {
      toast.warning('Please enter a valid quantity')
      return
    }

    // TODO: Implement actual order API call
    toast.success(`Order request sent to ${selectedSupplier.supplierInfo.companyName}`)
    setShowOrderModal(false)
    setOrderQuantity(1)
    setOrderNotes('')
  }

  // Get stock badge
  const getStockBadge = (stock) => {
    if (stock >= 100) {
      return <CBadge color="success">In Stock ({stock})</CBadge>
    } else if (stock > 0) {
      return <CBadge color="warning">Low Stock ({stock})</CBadge>
    } else {
      return <CBadge color="danger">Out of Stock</CBadge>
    }
  }

  // Get delivery badge
  const getDeliveryBadge = (estimate) => {
    if (estimate === 'Same Day') {
      return <CBadge color="success" className="d-flex align-items-center gap-1">
        <CIcon icon={cilCheckCircle} size="sm" />
        Same Day
      </CBadge>
    } else {
      return <CBadge color="info" className="d-flex align-items-center gap-1">
        <CIcon icon={cilInfo} size="sm" />
        Next Day
      </CBadge>
    }
  }

  return (
    <>
      <style>
        {`
          .medicine-autocomplete-item {
            transition: background-color 0.2s ease;
          }
          .medicine-autocomplete-item:hover {
            background-color: #f8f9fa;
          }
          .medicine-autocomplete-item:active {
            background-color: #e9ecef;
          }
        `}
      </style>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Live Medicine Rates Comparison</strong>
              <p className="text-muted small mb-0 mt-1">
                Compare medicine rates across multiple suppliers and find the best deal
              </p>
            </CCardHeader>
            <CCardBody>
              {/* Search Bar */}
              <CRow className="mb-4">
                <CCol md={8}>
                  <div style={{ position: 'relative' }}>
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilSearch} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Enter medicine name (e.g., Paracetamol, Dolo 650, etc.)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => {
                          if (suggestions.length > 0) {
                            setShowSuggestions(true)
                          }
                        }}
                        autoComplete="off"
                      />
                      <CButton color="primary" onClick={() => handleSearch()} disabled={loading}>
                        {loading ? <CSpinner size="sm" /> : 'Search'}
                      </CButton>
                    </CInputGroup>
                    
                    {/* Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                      <CListGroup
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '40px',
                          right: '90px',
                          zIndex: 1000,
                          maxHeight: '300px',
                          overflowY: 'auto',
                          marginTop: '2px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        {suggestions.map((medicine) => (
                          <CListGroupItem
                            key={medicine.id}
                            onClick={() => handleSelectMedicine(medicine)}
                            style={{ cursor: 'pointer' }}
                            className="medicine-autocomplete-item"
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong>{medicine.genericName}</strong>
                                <div className="small text-muted">{medicine.category}</div>
                                {medicine.commonBrands && medicine.commonBrands.length > 0 && (
                                  <div className="small text-muted mt-1">
                                    Common brands: {medicine.commonBrands.slice(0, 3).join(', ')}
                                    {medicine.commonBrands.length > 3 && '...'}
                                  </div>
                                )}
                              </div>
                              <CBadge color="info" className="ms-2">
                                {medicine.category}
                              </CBadge>
                            </div>
                          </CListGroupItem>
                        ))}
                      </CListGroup>
                    )}
                    
                    {searchingMedicines && (
                      <div className="text-muted small mt-1">
                        Searching medicines...
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>

              {/* Comparison Stats */}
              {comparisonData && comparisonData.suppliers.length > 0 && (
                <CRow className="mb-4">
                  <CCol md={12}>
                    <CAlert color="info" className="d-flex align-items-center justify-content-between">
                      <div>
                        <strong>Search Results for: "{searchQuery}"</strong>
                        <div className="mt-2">
                          <span className="me-3">
                            <strong>{comparisonData.comparison.count}</strong> suppliers found
                          </span>
                          <span className="me-3">
                            Lowest: <strong>{formatCurrency(comparisonData.comparison.lowestPrice)}</strong>
                          </span>
                          <span className="me-3">
                            Highest: <strong>{formatCurrency(comparisonData.comparison.highestPrice)}</strong>
                          </span>
                          <span className="me-3">
                            Average: <strong>{formatCurrency(comparisonData.comparison.averagePrice)}</strong>
                          </span>
                          {comparisonData.comparison.savingsPercentage > 0 && (
                            <CBadge color="success" className="ms-2">
                              <CIcon icon={cilTrendingUp} size="sm" className="me-1" />
                              Save up to {comparisonData.comparison.savingsPercentage}%
                            </CBadge>
                          )}
                        </div>
                      </div>
                    </CAlert>
                  </CCol>
                </CRow>
              )}

              {/* Results Table */}
              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-2">Searching suppliers...</p>
                </div>
              ) : comparisonData && comparisonData.suppliers.length > 0 ? (
                <div className="table-responsive">
                  <CTable hover bordered>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Supplier Details</CTableHeaderCell>
                        <CTableHeaderCell>Medicine Info</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Basic Rate</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Discount</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">GST (12%)</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Effective Rate</CTableHeaderCell>
                        <CTableHeaderCell>Stock</CTableHeaderCell>
                        <CTableHeaderCell>Delivery</CTableHeaderCell>
                        <CTableHeaderCell>Scheme</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {comparisonData.suppliers.map((item, index) => (
                        <CTableRow key={index}>
                          {/* Supplier Details */}
                          <CTableDataCell>
                            <div>
                              <strong className="d-flex align-items-center gap-2">
                                {item.supplierInfo.companyName}
                                {item.supplierInfo.rating >= 4 && (
                                  <CBadge color="primary" className="d-flex align-items-center gap-1">
                                    <CIcon icon={cilCheckCircle} size="sm" />
                                    Verified
                                  </CBadge>
                                )}
                                {item.isBestPrice && (
                                  <CBadge color="success">Best Price</CBadge>
                                )}
                              </strong>
                              <div className="small text-muted mt-1">
                                {item.supplierInfo.city}, {item.supplierInfo.state}
                              </div>
                              {renderStars(item.supplierInfo.rating || 0)}
                              <div className="d-flex gap-2 mt-2">
                                <a
                                  href={`tel:${item.supplierInfo.phone}`}
                                  className="text-decoration-none"
                                >
                                  <CIcon icon={cilPhone} size="sm" className="text-primary" />
                                </a>
                                <a
                                  href={`mailto:${item.supplierInfo.email}`}
                                  className="text-decoration-none"
                                >
                                  <CIcon icon={cilEnvelopeClosed} size="sm" className="text-primary" />
                                </a>
                              </div>
                            </div>
                          </CTableDataCell>

                          {/* Medicine Info */}
                          <CTableDataCell>
                            <div>
                              <strong>{item.medicine.name}</strong>
                              {item.medicine.genericName && (
                                <div className="small text-muted">
                                  Generic: {item.medicine.genericName}
                                </div>
                              )}
                              <div className="small text-muted">
                                {item.medicine.manufacturer}
                              </div>
                              <div className="small">
                                <CBadge color="secondary">
                                  {item.medicine.strength} | {item.medicine.packSize}
                                </CBadge>
                              </div>
                            </div>
                          </CTableDataCell>

                          {/* Basic Rate */}
                          <CTableDataCell className="text-end">
                            <div>
                              <strong>{formatCurrency(item.medicine.supplierPrice)}</strong>
                              <div className="small text-muted">
                                MRP: {formatCurrency(item.medicine.mrp)}
                              </div>
                            </div>
                          </CTableDataCell>

                          {/* Discount */}
                          <CTableDataCell className="text-end">
                            {item.medicine.discount > 0 ? (
                              <CBadge color="success">{item.medicine.discount}% OFF</CBadge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </CTableDataCell>

                          {/* GST */}
                          <CTableDataCell className="text-end">
                            <span className="text-muted">
                              {formatCurrency(item.medicine.gst)}
                            </span>
                          </CTableDataCell>

                          {/* Effective Rate */}
                          <CTableDataCell className="text-end">
                            <strong className={item.isBestPrice ? 'text-success' : ''}>
                              {formatCurrency(item.medicine.effectiveRate)}
                            </strong>
                          </CTableDataCell>

                          {/* Stock */}
                          <CTableDataCell>
                            {getStockBadge(item.medicine.stock)}
                          </CTableDataCell>

                          {/* Delivery */}
                          <CTableDataCell>
                            {getDeliveryBadge(item.medicine.deliveryEstimate)}
                          </CTableDataCell>

                          {/* Scheme */}
                          <CTableDataCell>
                            {item.medicine.scheme !== 'No Scheme' ? (
                              <CBadge color="warning">{item.medicine.scheme}</CBadge>
                            ) : (
                              <span className="text-muted small">No scheme</span>
                            )}
                          </CTableDataCell>

                          {/* Action */}
                          <CTableDataCell className="text-center">
                            <CButton
                              color="primary"
                              size="sm"
                              onClick={() => handleBuyNow(item)}
                              disabled={item.medicine.stock === 0}
                              className="d-flex align-items-center gap-1 mx-auto"
                            >
                              <CIcon icon={cilCart} size="sm" />
                              Buy Now
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              ) : searchQuery ? (
                <CAlert color="warning">
                  <CIcon icon={cilWarning} className="me-2" />
                  No suppliers found for "{searchQuery}". Try searching with a different medicine name.
                </CAlert>
              ) : (
                <CAlert color="info">
                  <CIcon icon={cilInfo} className="me-2" />
                  Enter a medicine name above to compare rates across suppliers
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Order Modal */}
      <CModal visible={showOrderModal} onClose={() => setShowOrderModal(false)} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>Place Order</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedSupplier && (
            <>
              <CRow className="mb-3">
                <CCol md={6}>
                  <strong>Supplier:</strong>
                  <p>{selectedSupplier.supplierInfo.companyName}</p>
                </CCol>
                <CCol md={6}>
                  <strong>Contact:</strong>
                  <p>
                    {selectedSupplier.supplierInfo.phone}
                    <br />
                    {selectedSupplier.supplierInfo.email}
                  </p>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={12}>
                  <strong>Medicine:</strong>
                  <p>
                    {selectedSupplier.medicine.name} - {selectedSupplier.medicine.strength} |{' '}
                    {selectedSupplier.medicine.packSize}
                  </p>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <strong>Rate per unit:</strong>
                  <p>{formatCurrency(selectedSupplier.medicine.effectiveRate)}</p>
                </CCol>
                <CCol md={4}>
                  <strong>Stock Available:</strong>
                  <p>{selectedSupplier.medicine.stock} units</p>
                </CCol>
                <CCol md={4}>
                  <strong>Delivery:</strong>
                  <p>{selectedSupplier.medicine.deliveryEstimate}</p>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <label className="form-label">Quantity</label>
                  <CFormInput
                    type="number"
                    min="1"
                    max={selectedSupplier.medicine.stock}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  />
                </CCol>
                <CCol md={6}>
                  <label className="form-label">Total Amount</label>
                  <CFormInput
                    type="text"
                    readOnly
                    value={formatCurrency(
                      selectedSupplier.medicine.effectiveRate * orderQuantity
                    )}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={12}>
                  <label className="form-label">Notes (Optional)</label>
                  <CFormTextarea
                    rows="3"
                    placeholder="Add any special instructions or requirements"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </CCol>
              </CRow>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowOrderModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmitOrder}>
            Confirm Order
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default LiveRatesComparison
