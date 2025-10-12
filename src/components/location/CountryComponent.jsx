import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllCountries } from '../../services/GetRequests';
import { createCountry } from '../../services/Inserts';
import { updateCountry, deleteCountry } from '../../services/UpdRequests';

const CountryComponent = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await getAllCountries();
      // Ensure data is always an array
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load countries: ' + err.message);
      setCountries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (country = null) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        name: country.name || ''
      });
    } else {
      setEditingCountry(null);
      setFormData({
        name: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCountry(null);
    setFormData({
      name: ''
    });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCountry) {
        await updateCountry(editingCountry.id, formData);
      } else {
        await createCountry(formData);
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
        await deleteCountry(countryId);
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
          <p className="text-muted">Manage countries with ISO codes, phone codes, and flags</p>
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
                    {Array.isArray(countries) && countries.length > 0 ? (
                      countries.map((country) => (
                        <tr key={country.id}>
                          <td>
                            {country.flagUrl ? (
                              <img 
                                src={country.flagUrl} 
                                alt={`${country.name} flag`} 
                                style={{ width: '30px', height: 'auto' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                            <i className="fas fa-flag text-muted"></i>
                          )}
                        </td>
                        <td><strong>{country.name}</strong></td>
                        <td>
                          {country.isoCode ? (
                            <code className="text-primary">{country.isoCode}</code>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          {country.phoneCode ? (
                            <span className="badge bg-secondary">+{country.phoneCode}</span>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          {country.description ? (
                            <span className="text-truncate" style={{maxWidth: '200px', display: 'inline-block'}} title={country.description}>
                              {country.description}
                            </span>
                          ) : (
                            <span className="text-muted">No description</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${country.active ? 'bg-success' : 'bg-secondary'}`}>
                            {country.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
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
                    ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          {loading ? 'Loading countries...' : 'No countries found'}
                        </td>
                      </tr>
                    )}
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
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country Name *</Form.Label>
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