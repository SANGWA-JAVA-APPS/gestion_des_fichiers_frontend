import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllLocations } from '../../services/GetRequests';
import { createLocation } from '../../services/Inserts';
import { updateLocation, deleteLocation } from '../../services/UpdRequests';

const CountryComponent = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isoCode: '',
    phoneCode: '',
    flagUrl: '',
    active: true
  });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await getAllLocations();
      setCountries(data);
    } catch (err) {
      setError('Failed to load countries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (country = null) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        name: country.name || '',
        description: country.description || '',
        isoCode: country.isoCode || '',
        phoneCode: country.phoneCode || '',
        flagUrl: country.flagUrl || '',
        active: country.active !== undefined ? country.active : true
      });
    } else {
      setEditingCountry(null);
      setFormData({
        name: '',
        description: '',
        isoCode: '',
        phoneCode: '',
        flagUrl: '',
        active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCountry(null);
    setFormData({
      name: '',
      description: '',
      isoCode: '',
      phoneCode: '',
      flagUrl: '',
      active: true
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCountry) {
        await updateLocation(editingCountry.id, formData);
      } else {
        await createLocation(formData);
      }
      handleCloseModal();
      loadCountries();
    } catch (err) {
      setError('Failed to save country: ' + err.message);
    }
  };

  const handleDelete = async (countryId) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      try {
        await deleteLocation(countryId);
        loadCountries();
      } catch (err) {
        setError('Failed to delete country: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>Country Management</h4>
          <p className="text-muted">Manage countries and their information</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="fas fa-plus me-2"></i>
            Add New Country
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col xs={12}>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              {countries.length === 0 ? (
                <Row>
                  <Col xs={12} className="text-center py-4">
                    <p className="text-muted">No countries found. Add your first country!</p>
                  </Col>
                </Row>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>ISO Code</th>
                      <th>Phone Code</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((country) => (
                      <tr key={country.id}>
                        <td>{country.name}</td>
                        <td><span className="badge bg-info">{country.code}</span></td>
                        <td>{country.description}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(country)}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(country.id)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
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
            <Container>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter country name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g. US, UK, FR"
                      maxLength="3"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter country description"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingCountry ? 'Update' : 'Create'} Country
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CountryComponent;