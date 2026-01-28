/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { FaEdit } from 'react-icons/fa'
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
// import { getFlagUrl } from '../../services/commonUtils'
import { useLanguage } from '../../i18n/LanguageContext'
import SimpleSearchComponent from '../SimpleSearchComponent'
import PaginationControl from '../PaginationControl'
import { useSearchParams } from 'react-router-dom'

const CountryComponent = () => {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCountry, setEditingCountry] = useState(null)
  const [searchParams] = useSearchParams()
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [formData, setFormData] = useState({
    countryName: '',
    countryIso2: '',
    description: '',
    phoneCode: '',
    flagUrl: ''
  })

  const { t, language } = useLanguage()

  // Load countries on mount
  useEffect(
    () => {
      loadCountries()
    },
    [searchParams]
  )

  const loadCountries = async () => {
    try {
      setLoading(true)
      const page = parseInt(searchParams.get('page') || '0', 10)
      const size = parseInt(searchParams.get('size') || '20', 10)
      const search = searchParams.get('search') || ''

      const data = await getAllCountries({
        page,
        size,
        search
      })
      console.log(' the data  we are receiving', data.pagination)

      // Handle different response structures
      const countriesArray = data.data || data

      setCountries(Array.isArray(countriesArray) ? countriesArray : [])
      console.log('thw total pages we have  ', data.pagination.totalPages)
      setTotalElements(data.pagination.totalElements || 0)
      setTotalPages(data.pagination.totalPages || 0)
    } catch (err) {
      console.log(t('countries.errorLoading') + err)
      setError(t('countries.errorLoading') + err.message)
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
      setError(t('countries.errorSaving') + err.message)
    }
  }

  const handleDelete = async countryId => {
    if (window.confirm(t('countries.deleteConfirm'))) {
      try {
        await deleteCountry(countryId)
        loadCountries()
      } catch (err) {
        setError(t('countries.errorDeleting') + err.message)
      }
    }
  }

  if (loading) {
    return (
      <Container>
        <Row>
          <Col xs={12} className='text-center'>
            <Spinner animation='border' role='status'>
              <span className='visually-hidden'>
                {t('common.loading')}
              </span>
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
          <h5>
            {t('adminMenu.countries')}
          </h5>
          <p className='text-muted'>
            {t('countries.subtitle')}
          </p>
        </Col>
        {/* <Col xs='auto'>
          <Button variant='primary' onClick={() => handleShowModal()}>
            <i className='fas fa-plus me-2' /> {t('countries.addCountry')}
          </Button>
        </Col> */}
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
              <SimpleSearchComponent />
              {countries.length === 0
                ? <Row>
                  <Col xs={12} className='text-center py-4'>
                    <p className='text-muted'>
                      {t('countries.noCountries')}
                    </p>
                  </Col>
                </Row>
                : <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>
                        {t('document.fields.flag')}
                      </th>
                      <th>
                        {t('document.fields.countryName')}
                      </th>
                      <th>
                        {t('document.fields.isoCode')}
                      </th>
                      <th>
                        {t('document.fields.phoneCode')}
                      </th>
                      <th>
                        {t('document.fields.description')}
                      </th>
                      <th>
                        {t('common.status')}
                      </th>
                      <th>
                        {t('countries.actions')}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {countries.map(country =>
                      <tr key={country.id}>
                        <td className='text-center'>
                          {country.isoCode
                              ? <img
                                src={country.flagUrl}
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
                          <span className='text-muted'>
                            {t('countries.notAvailable')}
                          </span>}
                        </td>
                        <td>
                          {country.phoneCode
                              ? <span className='badge bg-secondary'>
                                {country.phoneCode}
                              </span>
                              : <span className='text-muted'>
                                {t('countries.notAvailable')}
                              </span>}
                        </td>
                        <td>
                          {country.description ||
                          <span className='text-muted'>
                            {t('countries.noDescription')}
                          </span>}
                        </td>
                        <td>
                          <span
                            className={`badge ${country.active
                                ? 'bg-success'
                                : 'bg-secondary'}`}
                            >
                            {country.active
                                ? t('common.active')
                                : t('common.inactive')}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            className='me-2'
                            onClick={() => handleShowModal(country)}
                            >
                            <FaEdit />
                            <span className='visually-hidden'>{t('common.edit')}</span>
                          </Button>
                          {/* <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() => handleDelete(country.id)}
                            >
                            <i className='fas fa-trash' />{' '}
                            {t('common.delete')}
                          </Button> */}
                        </td>
                      </tr>
                      )}
                  </tbody>
                </Table>}
              <PaginationControl
                totalElements={totalElements}
                totalPages={totalPages}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Add/Edit Country */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCountry
              ? t('countries.editCountry')
              : t('countries.addCountry')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col xs={12}>
                <Form.Group className='mb-3'>
                  <Form.Label>
                    {t('countries.country')} *
                  </Form.Label>
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
                  <Form.Label>
                    {t('countries.description')}
                  </Form.Label>
                  <Form.Control
                    type='text'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={
                      language === 'fr'
                        ? 'Entrez la description'
                        : 'Enter description'
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button variant='primary' type='submit'>
              {editingCountry ? t('countries.update') : t('countries.create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default CountryComponent
