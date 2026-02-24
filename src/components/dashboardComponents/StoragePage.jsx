import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { apiClient } from "../../services/apiConfig";

const StoragePage = () => {
  const [totalBytes, setTotalBytes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeSizes, setTypeSizes] = useState([]);
  const [typeLoading, setTypeLoading] = useState(true);
  const [typeError, setTypeError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStorageSummary = async () => {
      try {
        setLoading(true);
        setTypeLoading(true);
        setError("");
        setTypeError("");

        const [totalResponse, typeResponse] = await Promise.all([
          apiClient.get("/dashboard/storage"),
          apiClient.get("/document/reporting/document-type-sizes")
        ]);

        if (!isMounted) return;

        const bytes = totalResponse?.data?.totalBytes;
        setTotalBytes(typeof bytes === "number" ? bytes : 0);

        const sizes = typeResponse?.data?.data;
        setTypeSizes(Array.isArray(sizes) ? sizes : []);
      } catch (err) {
        if (!isMounted) return;
        setError("Unable to load storage usage.");
        setTypeError("Unable to load document type sizes.");
        setTotalBytes(0);
        setTypeSizes([]);
      } finally {
        if (isMounted) {
          setLoading(false);
          setTypeLoading(false);
        }
      }
    };

    loadStorageSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatBytes = (value) => {
    if (value === null || Number.isNaN(value)) return "--";
    if (value === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = value;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const formattedTotal = useMemo(() => formatBytes(totalBytes), [totalBytes]);

  const formattedTypeSizes = useMemo(() => {
    return typeSizes.map((entry) => ({
      docType: entry.docType,
      totalBytes: formatBytes(entry.totalBytes || 0)
    }));
  }, [typeSizes]);

  const totalFromTypes = useMemo(() => {
    return typeSizes.reduce((sum, entry) => sum + (entry.totalBytes || 0), 0);
  }, [typeSizes]);

  return (
    <Container fluid className="dashboard-home">
      <div className="dashboard-header-sticky">
        <Row className="mb-3">
          <Col>
            <div className="page-title-group">
              <h4 className="dashboard-title mb-1">Storage</h4>
              <div className="dashboard-subtitle">
                Monitor storage usage, trends, and retention at a glance.
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="mb-3">Overview</h6>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <div className="fw-semibold">Total storage used</div>
                  {loading ? (
                    <div className="text-muted">Loading...</div>
                  ) : error ? (
                    <div className="text-danger">{error}</div>
                  ) : (
                    <div className="fs-5 fw-bold text-primary">{formattedTotal}</div>
                  )}
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-muted">
                    This total sums the stored size of all active documents.
                  </div>
                  {!loading && !error && typeSizes.length > 0 && (
                    <div className="small text-muted mt-2">
                      Sum of per-type totals: {formatBytes(totalFromTypes)}
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="mb-3">By document type</h6>
              {typeLoading ? (
                <div className="text-muted">Loading...</div>
              ) : typeError ? (
                <div className="text-danger">{typeError}</div>
              ) : formattedTypeSizes.length === 0 ? (
                <div className="text-muted">No data available.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {formattedTypeSizes.map((entry) => (
                    <div
                      key={entry.docType}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span className="text-capitalize">
                        {entry.docType.replace(/_/g, " ")}
                      </span>
                      <span className="fw-semibold">{entry.totalBytes}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StoragePage;
