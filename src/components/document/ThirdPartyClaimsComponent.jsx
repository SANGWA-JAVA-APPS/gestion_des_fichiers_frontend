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
import { getAllThirdPartyClaims } from "../../services/GetRequests";
import { createThirdPartyClaims, createThirdPartyClaimsWithFile } from "../../services/Inserts";
import {
  updateThirdPartyClaims,
  deleteThirdPartyClaims,
  updateThirdPartyClaimsWithFile,
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

const ThirdPartyClaimsComponent = () => {
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
    reference: "",
    description: "",
    dateClaim: "",
    departmentInCharge: "",
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
      const response = await getAllThirdPartyClaims({
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
        reference: item.reference || "",
        description: item.description || "",
        dateClaim: item.dateClaim
          ? item.dateClaim.split("T")[0]
          : "",
        departmentInCharge: item.departmentInCharge || "",
        status: { id: item.status?.id || "" },
      });
    } else {
      setEditingItem(null);
      setFormData({
        reference: "",
        description: "",
        dateClaim: "",
        departmentInCharge: "",
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
      reference: "",
      description: "",
      dateClaim: "",
      departmentInCharge: "",
      status: { id: "" },
    });
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
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
        reference: formData.reference,
        description: formData.description,
        dateClaim: formData.dateClaim
          ? new Date(formData.dateClaim).toISOString()
          : null,
        departmentInCharge: formData.departmentInCharge,
        doneBy: { id: CurrentUserId },
        status: formData.status.id
          ? { id: parseInt(formData.status.id) }
          : null,
      };

      if (!editingItem && selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("file", selectedFile);
        formDataToSend.append(
          "thirdPartyClaims",
          new Blob([JSON.stringify(dataToSubmit)], { type: "application/json" }),
        );
        await createThirdPartyClaimsWithFile(formDataToSend);
      } else if (editingItem) {
        if (selectedFile) {
          const formDataToSend = new FormData();
          formDataToSend.append("file", selectedFile);
          formDataToSend.append(
            "thirdPartyClaims",
            new Blob([JSON.stringify(dataToSubmit)], { type: "application/json" }),
          );
          await updateThirdPartyClaimsWithFile(editingItem.id, formDataToSend);
        } else {
          await updateThirdPartyClaims(editingItem.id, dataToSubmit);
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
      await deleteThirdPartyClaims(itemToDelete.id);
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
    <div className="third-party-claims-component">
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
                title={language === "fr" ? "Réclamations Tiers" : "Third Party Claims"}
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
                          {language === "fr" ? "Référence" : "Reference"}
                        </th>
                        <th>Description</th>
                        <th>
                          {language === "fr"
                            ? "Date de Réclamation"
                            : "Claim Date"}
                        </th>
                        <th>
                          {language === "fr"
                            ? "Département en Charge"
                            : "Department In Charge"}
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
                          <td colSpan="7" className="text-center text-muted">
                            {language === "fr"
                              ? "Aucune donnée disponible"
                              : "No data available"}
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.reference}</td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "200px" }}>
                              {item.description}
                            </td>
                            <td>
                              {item.dateClaim
                                ? new Date(
                                    item.dateClaim,
                                  ).toLocaleDateString(language)
                                : "-"}
                            </td>
                            <td>{item.departmentInCharge || "-"}</td>
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
                          it.reference || "Claim #" + it.id
                        }
                        getDescription={(it) =>
                          it.departmentInCharge
                            ? `${language === "fr" ? "Département" : "Department"}: ${it.departmentInCharge}`
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
              ? `${getText("common.edit", language)} ${language === "fr" ? "Réclamation Tiers" : "Third Party Claim"}`
              : `${getText("common.add", language)} ${language === "fr" ? "Réclamation Tiers" : "Third Party Claim"}`}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "fr" ? "Référence" : "Reference"} *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    required
                    placeholder={
                      language === "fr"
                        ? "Entrez la référence..."
                        : "Enter reference..."
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "fr"
                      ? "Département en Charge"
                      : "Department In Charge"}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="departmentInCharge"
                    value={formData.departmentInCharge}
                    onChange={handleChange}
                    placeholder={
                      language === "fr"
                        ? "Entrez le département..."
                        : "Enter department..."
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder={
                  language === "fr"
                    ? "Décrivez la réclamation..."
                    : "Describe the claim..."
                }
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "fr"
                      ? "Date de Réclamation"
                      : "Claim Date"}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dateClaim"
                    value={formData.dateClaim}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
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
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    {language === "fr" ? "Document" : "Document"}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                    required={!editingItem}
                  />
                  {selectedFile && (
                    <Form.Text className="text-success">
                      {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </Form.Text>
                  )}
                  {editingItem && !selectedFile && (
                    <Form.Text className="text-muted">
                      {language === "fr"
                        ? "Le document actuel sera conservé si aucun nouveau fichier n'est sélectionné"
                        : "Current document will be kept if no new file is selected"}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
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
                  {language === "fr" ? "Référence:" : "Reference:"}
                </strong>{" "}
                {itemToDelete.reference}
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
          selectedDocument?.reference || "Third Party Claim Details"
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
                      {language === "fr" ? "Référence:" : "Reference:"}
                    </strong>{" "}
                    {selectedDocument.reference || "-"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Description:</strong>{" "}
                    {selectedDocument.description || "-"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>
                      {language === "fr"
                        ? "Date de Réclamation:"
                        : "Claim Date:"}
                    </strong>{" "}
                    {selectedDocument.dateClaim
                      ? new Date(
                          selectedDocument.dateClaim,
                        ).toLocaleDateString(language)
                      : "-"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>
                      {language === "fr"
                        ? "Département en Charge:"
                        : "Department In Charge:"}
                    </strong>{" "}
                    {selectedDocument.departmentInCharge || "-"}
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

export default ThirdPartyClaimsComponent;
