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

const SectionCategoryComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [language] = useState("fr");

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

  const handleDelete = async (id) => {
    if (window.confirm(getText("document.messages.confirmDelete", language))) {
      try {
        setError("");
        await deleteSectionCategory(id);
        loadData();
      } catch (err) {
        setError(
          getText("document.messages.deleteError", language) +
            ": " +
            (err.message || "Unknown error")
        );
        console.error("Delete error:", err);
      }
    }
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
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
             
                  <h4 className="mb-0">
                    {getText("document.sectionCategory", language)}
                  </h4>
                
              <div>
                <Button
                  variant="primary" size="sm"
                  className="me-2"  onClick={() => handleShowModal()}>
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
              </div>
            </Card.Header>
            <Card.Body>
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
                      <th className="text-center" style={{ width: "150px" }}>
                        {getText("common.edit", language)} /{" "}
                        {getText("common.delete", language)}
                      </th>
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
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleShowModal(item)}>
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(item.id)}>
                              <i className="bi bi-trash"></i>
                            </Button>
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
    </div>
  );
};

export default SectionCategoryComponent;
