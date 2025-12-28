import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Spinner
} from 'react-bootstrap'
import { getAllCountries } from '../../services/GetRequests'
import { createCountry } from '../../services/Inserts'
import { updateCountry, deleteCountry } from '../../services/UpdRequests'
import CountryInput from '../CountryInput'
import { getFlagUrl } from '../../services/commonUtils'

const CountryComponent = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCountry, setEditingCountry] = useState(null)
  const [formData, setFormData] = useState({
    countryName: '',
    countryIso2: '',
    description: '',
    phoneCode: '',
    flagUrl: ''
  })

  // Load countries on mount
  useEffect(() => {
    loadCountries()
  }, [])

  const loadCountries = async () => {
    try {
      setLoading(true)
      const data = await getAllCountries()
      setCountries(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load countries: ' + err.message)
      setCountries([])
    } finally {
      setLoading(false)
    }
  }

  const handleShowModal = (country = null) => {
    if (country) {
      setEditingCountry(country)
      setFormData({
        countryName: country.name || '',
        countryIso2: country.isoCode || '',
        description: country.description || '',
        phoneCode: country.phoneCode || '',
        flagUrl: country.flagUrl || ''
      })
    } else {
      setEditingCountry(null)
      setFormData({
        countryName: '',
        countryIso2: '',
        description: '',
        phoneCode: '',
        flagUrl: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCountry(null)
    setFormData({
      countryName: '',
      countryIso2: '',
      description: '',
      phoneCode: '',
      flagUrl: ''
    })
  }

  const handleChange = e => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.countryName,
        isoCode: formData.countryIso2,
        description: formData.description,
        phoneCode: formData.phoneCode,
        flagUrl: formData.flagUrl
      }

      if (editingCountry) {
        await updateCountry(editingCountry.id, payload)
      } else {
        await createCountry(payload)
      }

      handleCloseModal()
      loadCountries()
    } catch (err) {
      setError('Failed to save country: ' + err.message)
    }
  }

  const handleDelete = async countryId => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      try {
        await deleteCountry(countryId)
        loadCountries()
      } catch (err) {
        setError('Failed to delete country: ' + err.message)
      }
    }
  }

  if (loading) {
    return (
      <Container>
        <Row>
          <Col xs={12} className='text-center'>
            <Spinner animation='border' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </Spinner>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container fluid>
      <Row className='mb-4'>
        <Col>
          <h5>Country Management</h5>
          <p className='text-muted'>
            Manage countries with ISO codes, phone codes, and flags
          </p>
        </Col>
        <Col xs='auto'>
          <Button variant='primary' onClick={() => handleShowModal()}>
            <i className='fas fa-plus me-2' /> Add New Country
          </Button>
        </Col>
      </Row>

      {error &&
        <Row className='mb-3'>
          <Col xs={12}>
            <Alert variant='danger' dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              {countries.length === 0
                ? <Row>
                  <Col xs={12} className='text-center py-4'>
                    <p className='text-muted'>
                        No countries found. Add your first country!
                      </p>
                  </Col>
                </Row>
                : <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Flag</th>
                      <th>Country</th>
                      <th>ISO Code</th>
                      <th>Phone Code</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map(country =>
                      <tr key={country.id}>
                        <td className='text-center'>
                          {country.isoCode
                              ? <img
                                src={getFlagUrl(country.isoCode)}
                                alt={`${country.name} flag`}
                                width={30}
                                height='auto'
                                onError={e =>
                                    (e.target.style.display = 'none')}
                                />
                              : <i className='fas fa-flag text-muted' />}
                        </td>

                        <td>
                          <strong>
                            {country.name}
                          </strong>
                        </td>
                        <td>
                          {country.isoCode ||
                          <span className='text-muted'>N/A</span>}
                        </td>
                        <td>
                          {country.phoneCode
                              ? <span className='badge bg-secondary'>
                                {country.phoneCode}
                              </span>
                              : <span className='text-muted'>N/A</span>}
                        </td>
                        <td>
                          {country.description ||
                          <span className='text-muted'>
                                No description
                              </span>}
                        </td>
                        <td>
                          <span
                            className={`badge ${country.active
                                ? 'bg-success'
                                : 'bg-secondary'}`}
                            >
                            {country.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            className='me-2'
                            onClick={() => handleShowModal(country)}
                            >
                            <i className='fas fa-edit' /> Edit
                            </Button>
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() => handleDelete(country.id)}
                            >
                            <i className='fas fa-trash' /> Delete
                            </Button>
                        </td>
                      </tr>
                      )}
                  </tbody>
                </Table>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Add/Edit Country */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCountry ? 'Edit Country' : 'Add New Country'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col xs={12}>
                <Form.Group className='mb-3'>
                  <Form.Label>Country *</Form.Label>
                  <CountryInput
                    value={formData.countryName || ''}
                    onChange={country =>
                      setFormData({
                        ...formData,
                        countryName: country.name,
                        countryIso2: country.iso2,
                        phoneCode: country.dialCode,
                        flagUrl: country.emoji
                      })}
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type='text'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    placeholder='Enter description'
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant='primary' type='submit'>
              {editingCountry ? 'Update' : 'Create'} Country
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default CountryComponent
