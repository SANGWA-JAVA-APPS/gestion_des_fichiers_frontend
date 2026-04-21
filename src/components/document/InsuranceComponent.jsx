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
  Badge,
  ListGroup,
  Nav,
} from "react-bootstrap";
import { getAllInsurance } from "../../services/GetRequests";
import { createInsurance, createInsuranceWithFile } from "../../services/Inserts";
import {
  updateInsurance,
  deleteInsurance,
  updateInsuranceWithFile,
} from "../../services/UpdRequests";
import { getAllDocStatuses } from "../../services/GetRequests";
import { getText } from "../../data/texts";
import HeaderTitle from "../HeaderTitle";
import PageHeaderCard from "../PageHeaderCard";
import DocumentDetailsView from "./DocumentDetailsView";
import DownloadConfirmationModal from "./DownloadConfirmationModal";
import {
  downloadFile,
  formatFileSize,
  openFileInNewTab,
} from "../../services/downloadService";
import { getUserInfo } from "../../services/authUtils";
import { useLanguage } from "../../i18n/LanguageContext";
import PaginationControl from "../PaginationControl";
import { useSearchParams } from "react-router-dom";
import SimpleSearchComponent from "../SimpleSearchComponent";
import DocumentCard from "../DocumentCard";

const InsuranceComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [docStatuses, setDocStatuses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const CurrentUserId = getUserInfo().userId;
  const [formData, setFormData] = useState({
    concerns: "",
    coverage: "",
    insuranceValue: "",
    dateValidity: "",
    renewalDate: "",
    doneBy: { id: "" },
    status: { id: "" },
  });
  const { language } = useLanguage();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [totalElements, setTotalElements] = useState(0);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);

  const [activeView, setActiveView] = useState("cards");

  const [searchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "20", 10);
  const search = searchParams.get("search") || null;
  const statusId = searchParams.get("statusId")
    ? Number(searchParams.get("statusId"))
    : null;

  useEffect(() => {
    loadData();
    loadDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllInsurance({
        page,
        size,
        search,
        statusId,
      });
      setData(response.content || []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(
        (language === "fr" ? "Erreur de chargement" : "Load error") +
          ": " +
          (err.message || "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [statusesData] = await Promise.all([getAllDocStatuses()]);
      setDocStatuses(Array.isArray(statusesData) ? statusesData : []);
    } catch (err) {
      console.error("Load dropdown data error:", err);
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        concerns: item.concerns || "",
        coverage: item.coverage || "",
        insuranceValue: item.insuranceValue || item.insuredValue || "",
        dateValidity: item.dateValidity
          ? item.dateValidity.split("T")[0]
          : "",
        renewalDate: item.renewalDate
          ? item.renewalDate.split("T")[0]
          : "",
        status: { id: item.status?.id || "" },
      });
    } else {
      setEditingItem(null);
      setFormData({
        concerns: "",
        coverage: "",
        insuranceValue: "",
        dateValidity: "",
        renewalDate: "",
        status: { id: "" },
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setSelectedFile(null);
    setFormData({
      concerns: "",
      coverage: "",
      insuranceValue: "",
      dateValidity: "",
      renewalDate: "",
      status: { id: "" },
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");

      if (!editingItem && !selectedFile) {
        setError(
          language === "fr"
            ? "Veuillez sélectionner un fichier"
            : "Please select a file",
        );
        return;
      }

      const dataToSubmit = {
        concerns: formData.concerns,
        coverage: formData.coverage,
        insuranceValue: formData.insuranceValue
          ? parseFloat(formData.insuranceValue)
          : null,
        dateValidity: formData.dateValidity
          ? new Date(formData.dateValidity).toISOString()
          : null,
        renewalDate: formData.renewalDate
          ? new Date(formData.renewalDate).toISOString()
          : null,
        doneBy: { id: CurrentUserId },
        status: formData.status.id
          ? { id: parseInt(formData.status.id) }
          : null,
      };

      if (!editingItem && selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("file", selectedFile);
        formDataToSend.append(
          "insurance",
          new Blob([JSON.stringify(dataToSubmit)], { type: "application/json" }),
        );
        await createInsuranceWithFile(formDataToSend);
      } else if (editingItem) {
        if (selectedFile) {
          const formDataToSend = new FormData();
          formDataToSend.append("file", selectedFile);
          formDataToSend.append(
            "insurance",
            new Blob([JSON.stringify(dataToSubmit)], { type: "application/json" }),
          );
          await updateInsuranceWithFile(editingItem.id, formDataToSend);
        } else {
          await updateInsurance(editingItem.id, dataToSubmit);
        }
      }

      handleCloseModal();
      loadData();
    } catch (err) {
      setError(
        (language === "fr" ? "Erreur de sauvegarde" : "Save error") +
          ": " +
          (err.message || "Unknown error"),
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
      await deleteInsurance(itemToDelete.id);
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      setError(
        (language === "fr" ? "Erreur de suppression" : "Delete error") +
          ": " +
          (err.message || "Unknown error"),
      );
      console.error("Delete error:", err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleShowDetails = (item) => {
    setSelectedDocument(item);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedDocument(null);
  };

  const handleConfirmDownload = async () => {
    if (!fileToDownload || !fileToDownload.document) return;
    try {
      await downloadFile(fileToDownload.document);
      setShowDownloadModal(false);
      setFileToDownload(null);
    } catch (err) {
      console.error("Download error:", err);
      alert(
        language === "fr"
          ? `Erreur lors du téléchargement: ${err.message}`
          : `Download error: ${err.message}`,
      );
    }
  };

  const handleCancelDownload = () => {
    setShowDownloadModal(false);
    setFileToDownload(null);
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
    <div className="insurance-component">
      <style jsx>{`
        .action-buttons .btn {
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease-in-out;
        }
        .action-buttons .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <PageHeaderCard
                title={language === "fr" ? "Suivi d'Assurance" : "Insurance Follow Up"}
                language={language}
                onAdd={() => handleShowModal()}
                onRefresh={loadData}
                activeView={activeView}
                onViewChange={(k) => setActiveView(k)}
              />
            </Card.Header>
            <Card.Body>
              <SimpleSearchComponent />
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              {/* Table View */}
              {activeView === "table" && (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>
                          {language === "fr" ? "Préoccupations" : "Concerns"}
                        </th>
                        <th>
                          {language === "fr" ? "Couverture" : "Coverage"}
                        </th>
                        <th>
                          {language === "fr"
                            ? "Valeur Assurance"
                            : "Insurance Value"}
                        </th>
                        <th>
                          {language === "fr"
                            ? "Date de Validité"
                            : "Date Validity"}
                        </th>
                        <th>
                          {language === "fr"
                            ? "Date de Renouvellement"
                            : "Renewal Date"}
                        </th>
                        <th>{getText("document.fields.status", language)}</th>
                        <th className="text-center" style={{ width: "200px" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">
                            {language === "fr"
                              ? "Aucune donnée disponible"
                              : "No data available"}
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "200px" }}>
                              {item.concerns}
                            </td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "150px" }}>
                              {item.coverage}
                            </td>
                            <td>
                              {item.insuranceValue ?? item.insuredValue ?? "-"}
                            </td>
                            <td>
                              {item.dateValidity
                                ? new Date(
                                    item.dateValidity,
                                  ).toLocaleDateString(language)
                                : "-"}
                            </td>
                            <td>
                              {item.renewalDate
                                ? new Date(
                                    item.renewalDate,
                                  ).toLocaleDateString(language)
                                : "-"}
                            </td>
                            <td>
                              <Badge bg="info">
                                {item.statusName || "-"}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center action-buttons">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleShowDetails(item)}
                                  className="d-flex align-items-center"
                                  title={
                                    language === "fr"
                                      ? "Voir les détails"
                                      : "View Details"
                                  }>
                                  <i className="bi bi-eye me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {language === "fr" ? "Voir" : "View"}
                                  </span>
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleShowModal(item)}
                                  className="d-flex align-items-center"
                                  title={getText("common.edit", language)}>
                                  <i className="bi bi-pencil me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {getText("common.edit", language)}
                                  </span>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
                                  className="d-flex align-items-center"
                                  title={getText("common.delete", language)}>
                                  <i className="bi bi-trash me-1"></i>
                                  <span className="d-none d-sm-inline">
                                    {getText("common.delete", language)}
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
              )}

              {/* Cards View */}
              {activeView === "cards" && (
                <Row className="g-4">
                  {data.length === 0 ? (
                    <Col xs={12}>
                      <Alert variant="info" className="text-center">
                        <i className="bi bi-info-circle me-2"></i>
                        {language === "fr"
                          ? "Aucune donnée disponible"
                          : "No data available"}
                      </Alert>
                    </Col>
                  ) : (
                    data.map((item) => (
                      <DocumentCard
                        key={item.id}
                        item={item}
                        language={language}
                        onViewDetails={handleShowDetails}
                        onEdit={handleShowModal}
                        onDelete={handleDeleteClick}
                        getDisplayName={(it) =>
                          it.concerns || "Insurance #" + it.id
                        }
                        getDescription={(it) =>
                          it.coverage
                            ? `${language === "fr" ? "Couverture" : "Coverage"}: ${it.coverage}`
                            : ""
                        }
                      />
                    ))
                  )}
                </Row>
              )}
              <PaginationControl
                totalElements={totalElements}
                totalPages={totalPages}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem
              ? `${getText("common.edit", language)} ${language === "fr" ? "Assurance" : "Insurance"}`
              : `${getText("common.add", language)} ${language === "fr" ? "Assurance" : "Insurance"}`}
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
                {language === "fr" ? "Préoccupations" : "Concerns"} *
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="concerns"
                value={formData.concerns}
                onChange={handleChange}
                required
                placeholder={
                  language === "fr"
                    ? "Décrivez les préoccupations..."
                    : "Describe the concerns..."
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {language === "fr" ? "Couverture" : "Coverage"} *
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="coverage"
                value={formData.coverage}
                onChange={handleChange}
                required
                placeholder={
                  language === "fr"
                    ? "Décrivez la couverture..."
                    : "Describe the coverage..."
                }
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "fr"
                      ? "Valeur Assurance"
                      : "Insurance Value"}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="insuranceValue"
                    value={formData.insuranceValue}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "fr"
                      ? "Date de Validité"
                      : "Date Validity"}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dateValidity"
                    value={formData.dateValidity}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "fr"
                      ? "Date de Renouvellement"
                      : "Renewal Date"}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="renewalDate"
                    value={formData.renewalDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                {getText("document.fields.status", language)} *
              </Form.Label>
              <Form.Select
                name="status.id"
                value={formData.status.id}
                onChange={handleChange}
                required>
                <option value="">
                  {getText("common.select", language)}
                </option>
                {docStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {getText("document.fields.docId", language)} *
              </Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                required={!editingItem}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
              />
              {selectedFile && (
                <Form.Text className="text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(2)} KB)
                </Form.Text>
              )}
              {editingItem && !selectedFile && (
                <Form.Text className="text-muted">
                  <i className="bi bi-file-earmark me-1"></i>
                  {language === "fr"
                    ? "Document actuel conservé"
                    : "Current document kept"}
                </Form.Text>
              )}
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
            {getText("common.confirmDelete", language)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center">
            <i
              className="bi bi-trash text-danger"
              style={{ fontSize: "3rem" }}></i>
            <h5 className="mt-3 mb-3">
              {language === "fr"
                ? "Êtes-vous sûr de vouloir supprimer cet élément ?"
                : "Are you sure you want to delete this item?"}
            </h5>
            {itemToDelete && (
              <div className="bg-light p-3 rounded">
                <strong>
                  {language === "fr" ? "Préoccupations:" : "Concerns:"}
                </strong>{" "}
                {itemToDelete.concerns}
              </div>
            )}
            <p className="text-muted mt-3 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              {language === "fr"
                ? "Cette action est irréversible."
                : "This action cannot be undone."}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex gap-2 w-100 justify-content-end">
            <Button variant="outline-secondary" onClick={handleDeleteCancel}>
              <i className="bi bi-x-circle me-2"></i>
              {getText("common.cancel", language)}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <i className="bi bi-trash me-2"></i>
              {getText("common.delete", language)}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Document Details Modal */}
      <DocumentDetailsView
        show={showDetailsModal}
        onHide={handleCloseDetails}
        title={
          selectedDocument?.concerns || "Insurance Details"
        }
        closeButtonText={language === "fr" ? "Fermer" : "Close"}>
        {selectedDocument && (
          <div>
            <Row className="mb-3">
              <Col md={6}>
                <h6 className="text-muted">
                  {language === "fr"
                    ? "Informations Générales"
                    : "General Information"}
                </h6>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>
                      {language === "fr" ? "Préoccupations:" : "Concerns:"}
                    </strong>{" "}
                    {selectedDocument.concerns || "-"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>
                      {language === "fr" ? "Couverture:" : "Coverage:"}
                    </strong>{" "}
                    {selectedDocument.coverage || "-"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>
                      {language === "fr"
                        ? "Valeur Assurance:"
                        : "Insurance Value:"}
                    </strong>{" "}
                    {selectedDocument.insuranceValue ??
                      selectedDocument.insuredValue ??
                      "-"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>
                      {language === "fr"
                        ? "Date de Validité:"
                        : "Date Validity:"}
                    </strong>{" "}
                    {selectedDocument.dateValidity
                      ? new Date(
                          selectedDocument.dateValidity,
                        ).toLocaleDateString(language)
                      : "-"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>
                      {language === "fr"
                        ? "Date de Renouvellement:"
                        : "Renewal Date:"}
                    </strong>{" "}
                    {selectedDocument.renewalDate
                      ? new Date(
                          selectedDocument.renewalDate,
                        ).toLocaleDateString(language)
                      : "-"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>
                      {getText("document.fields.status", language)}:
                    </strong>{" "}
                    <Badge bg="info">
                      {selectedDocument.statusName || "-"}
                    </Badge>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={6}>
                <h6 className="text-muted">
                  {language === "fr"
                    ? "Informations du Document"
                    : "Document Information"}
                </h6>
                {selectedDocument.documentFileName ? (
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>
                        {language === "fr" ? "Nom du fichier:" : "File name:"}
                      </strong>{" "}
                      <small>{selectedDocument.documentFileName}</small>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>
                        {language === "fr" ? "Nom original:" : "Original name:"}
                      </strong>{" "}
                      {selectedDocument.documentOriginalFileName}
                    </ListGroup.Item>
                  </ListGroup>
                ) : (
                  <Alert variant="warning">
                    {language === "fr"
                      ? "Aucune information de document disponible"
                      : "No document information available"}
                  </Alert>
                )}
              </Col>
            </Row>

            {selectedDocument.doneByFullName && (
              <Row>
                <Col>
                  <h6 className="text-muted">
                    {getText("document.fields.doneBy", language)}
                  </h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>
                        {language === "fr" ? "Nom complet:" : "Full name:"}
                      </strong>{" "}
                      {selectedDocument.doneByFullName}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            )}

            <div className="mt-4 d-flex gap-2">
              <Button
                variant="warning"
                size="sm"
                onClick={() => {
                  handleCloseDetails();
                  handleShowModal(selectedDocument);
                }}>
                <i className="bi bi-pencil me-2"></i>
                {language === "fr" ? "Modifier" : "Edit"}
              </Button>
            </div>
          </div>
        )}
      </DocumentDetailsView>

      <DownloadConfirmationModal
        show={showDownloadModal}
        onHide={handleCancelDownload}
        onConfirm={handleConfirmDownload}
        fileName={fileToDownload?.document?.originalFileName || ""}
        fileSize={
          fileToDownload?.document?.fileSize
            ? formatFileSize(fileToDownload.document.fileSize)
            : null
        }
        language={language}
      />
    </div>
  );
};

export default InsuranceComponent;
