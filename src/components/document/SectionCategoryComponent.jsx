import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { getAllSectionCategories } from "../../services/GetRequests";
import { createSectionCategory } from "../../services/Inserts";
import {
  updateSectionCategory,
  deleteSectionCategory,
} from "../../services/UpdRequests";
import { getText } from "../../data/texts";
import SearchComponent from "../SearchComponent";
import HeaderTitle from "../HeaderTitle";

const SectionCategoryComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [language] = useState("fr");

  // Search state
  const [searchFilters, setSearchFilters] = useState({
    statusFilter: '',
    searchText: '',
    dateStart: '',
    dateEnd: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllSectionCategories();
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(
        getText("document.messages.loadError", language) +
        ": " +
        (err.message || "Unknown error")
      );
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (searchData) => {
    console.log('=== SEARCH COMPONENT VALUES ===');
    console.log('All Search Data:', searchData);
    console.log('Dropdown (Status Filter):', searchData.dropdown);
    console.log('Textbox 1 (Search Text):', searchData.textbox1);
    console.log('Textbox 2:', searchData.textbox2);
    console.log('Textbox 3:', searchData.textbox3);
    console.log('Date Start:', searchData.dateStart);
    console.log('Date End:', searchData.dateEnd);
    console.log('===============================');

    setSearchFilters({
      statusFilter: searchData.dropdown,
      searchText: searchData.textbox1,
      dateStart: searchData.dateStart,
      dateEnd: searchData.dateEnd
    });
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: "" });
    setError("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      if (editingItem) {
        await updateSectionCategory(editingItem.id, formData);
      } else {
        await createSectionCategory(formData);
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setError(
        getText("document.messages.saveError", language) +
        ": " +
        (err.message || "Unknown error")
      );
      console.error("Save error:", err);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setError("");
      await deleteSectionCategory(itemToDelete.id);
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      setError(
        getText("document.messages.deleteError", language) +
        ": " +
        (err.message || "Unknown error")
      );
      console.error("Delete error:", err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">
            {getText("common.loading", language)}
          </span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="section-category-component">
      <style jsx>{`
        .action-buttons .btn {
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease-in-out;
        }
        .action-buttons .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .action-buttons .btn-outline-warning:hover {
          background-color: #ffc107;
          border-color: #ffc107;
          color: #000;
        }
        .action-buttons .btn-outline-danger:hover {
          background-color: #dc3545;
          border-color: #dc3545;
          color: white;
        }
        @media (max-width: 576px) {
          .action-buttons .btn {
            padding: 0.2rem 0.4rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>{getText("document.sectionCategory", language)}</HeaderTitle>
                </Col>
                <Col xs={12} md={6} lg={9} className="text-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowModal()}>
                    <i className="bi bi-plus-circle me-1"></i>
                    {getText("common.add", language)}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={loadData}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {getText("document.actions.refresh", language)}
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {/* Search Component */}
              <SearchComponent
                dropdownLabel="Category"
                dropdownItems={[]}
                dropdownValue={searchFilters.statusFilter}
                onDropdownChange={(value) => setSearchFilters({ ...searchFilters, statusFilter: value })}

                textbox1Label="Search Name"
                textbox1Placeholder="Enter category name..."
                textbox1Value={searchFilters.searchText}
                onTextbox1Change={(value) => setSearchFilters({ ...searchFilters, searchText: value })}

                dateStartLabel="From Date"
                dateStartValue={searchFilters.dateStart}
                onDateStartChange={(value) => setSearchFilters({ ...searchFilters, dateStart: value })}

                dateEndLabel="To Date"
                dateEndValue={searchFilters.dateEnd}
                onDateEndChange={(value) => setSearchFilters({ ...searchFilters, dateEnd: value })}

                onSearch={handleSearch}
                searchButtonText="Search"

                showTextbox2={false}
                showTextbox3={false}
              />

              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>{getText("document.fields.id", language)}</th>
                      <th>{getText("document.fields.name", language)}</th>
                      <th className="text-center" style={{ width: "200px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          {language === "fr"
                            ? "Aucune donnée disponible"
                            : "No data available"}
                        </td>
                      </tr>
                    ) : (
                      data.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center action-buttons">
                              {/* Edit Button */}
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleShowModal(item)}
                                className="d-flex align-items-center"
                                title={getText('common.edit', language)}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                <span className="d-none d-sm-inline">
                                  {getText('common.edit', language)}
                                </span>
                              </Button>

                              {/* Delete Button */}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(item)}
                                className="d-flex align-items-center"
                                title={getText('common.delete', language)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                <span className="d-none d-sm-inline">
                                  {getText('common.delete', language)}
                                </span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem
              ? `${getText("common.edit", language)} ${getText(
                "document.sectionCategory",
                language
              )}`
              : `${getText("common.add", language)} ${getText(
                "document.sectionCategory",
                language
              )}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                {getText("document.fields.name", language)} *
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={
                  language === "fr"
                    ? "Entrer le nom de la catégorie"
                    : "Enter category name"
                }
              />
              <Form.Text className="text-muted">
                {language === "fr"
                  ? "Ex: financial, procurement, hr, technical, IT, real Estate, shareholders, legal, quality, HSE, equipment, drug and alcohol, incident, newsletter, SOP"
                  : "Ex: financial, procurement, hr, technical, IT, real Estate, shareholders, legal, quality, HSE, equipment, drug and alcohol, incident, newsletter, SOP"}
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {getText("common.cancel", language)}
            </Button>
            <Button variant="primary" type="submit">
              {getText("common.save", language)}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {getText('common.confirmDelete', language)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center">
            <i className="bi bi-trash text-danger" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3 mb-3">
              {language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet élément ?' : 'Are you sure you want to delete this item?'}
            </h5>
            {itemToDelete && (
              <div className="bg-light p-3 rounded">
                <strong>{getText('document.fields.name', language)}:</strong> {itemToDelete.name}
              </div>
            )}
            <p className="text-muted mt-3 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              {language === 'fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex gap-2 w-100 justify-content-end">
            <Button variant="outline-secondary" onClick={handleDeleteCancel}>
              <i className="bi bi-x-circle me-2"></i>
              {getText('common.cancel', language)}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <i className="bi bi-trash me-2"></i>
              {getText('common.delete', language)}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SectionCategoryComponent;
