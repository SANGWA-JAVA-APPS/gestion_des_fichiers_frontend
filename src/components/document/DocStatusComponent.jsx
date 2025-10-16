import React, { useState, useEffect } from "react";
import {
  Row,  Col,  Card,  Button,
  Table,  Modal,  Form,  Alert,  Spinner,
} from "react-bootstrap";
import { getAllDocStatuses } from "../../services/GetRequests";
import { createDocStatus } from "../../services/Inserts";
import { updateDocStatus, deleteDocStatus } from "../../services/UpdRequests";
import { getText } from "../../data/texts";
import SearchComponent from "../SearchComponent";
import HeaderTitle from "../HeaderTitle";

const DocStatusComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [language] = useState("fr"); // Can be made dynamic with context
  
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
      const response = await getAllDocStatuses();
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
    
    // Implement your search logic here
    // You can filter the data based on searchData
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
        await updateDocStatus(editingItem.id, formData);
      } else {
        await createDocStatus(formData);
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
        await deleteDocStatus(id);
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
    <div className="doc-status-component">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>{getText("document.docStatus", language)}</HeaderTitle>
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
                dropdownLabel="Status"
                dropdownItems={data.map(item => ({ value: item.name, label: item.name }))}
                dropdownValue={searchFilters.statusFilter}
                onDropdownChange={(value) => setSearchFilters({...searchFilters, statusFilter: value})}
                
                textbox1Label="Search Name"
                textbox1Placeholder="Enter status name..."
                textbox1Value={searchFilters.searchText}
                onTextbox1Change={(value) => setSearchFilters({...searchFilters, searchText: value})}
                
                dateStartLabel="From Date"
                dateStartValue={searchFilters.dateStart}
                onDateStartChange={(value) => setSearchFilters({...searchFilters, dateStart: value})}
                
                dateEndLabel="To Date"
                dateEndValue={searchFilters.dateEnd}
                onDateEndChange={(value) => setSearchFilters({...searchFilters, dateEnd: value})}
                
                onSearch={handleSearch} searchButtonText="Search"
                
                showTextbox2={false} showTextbox3={false}
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
                  "document.docStatus",
                  language
                )}`
              : `${getText("common.add", language)} ${getText(
                  "document.docStatus",
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
                    ? "Entrer le nom du statut"
                    : "Enter status name"
                }
              />
              <Form.Text className="text-muted">
                {language === "fr"
                  ? "Ex: applicable, suspendu, remplacé, annulé, en_cours, acquis, vendu, transféré, litigieux, validé"
                  : "Ex: applicable, suspended, replaced, cancelled, in_progress, acquired, sold, transferred, litigious, validated"}
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

export default DocStatusComponent;
