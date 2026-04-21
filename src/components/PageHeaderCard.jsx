import React from "react";
import { Row, Col, Button, Nav } from "react-bootstrap";
import HeaderTitle from "./HeaderTitle";
import { getText } from "../data/texts";

const PageHeaderCard = ({
  title,
  language,
  onAdd,
  onRefresh,
  addText,
  refreshText,
  activeView,
  onViewChange,
}) => {
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col xs={12} md={6} lg={3}>
          <HeaderTitle>{title}</HeaderTitle>
        </Col>
        <Col xs={12} md={6} lg={9} className="text-end">
          <Button
            variant="primary"
            size="sm"
            className="me-2"
            onClick={onAdd}>
            <i className="bi bi-plus-circle me-1"></i>
            {addText || getText("common.add", language)}
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={onRefresh}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            {refreshText || getText("document.actions.refresh", language)}
          </Button>
        </Col>
      </Row>

      {activeView !== undefined && onViewChange && (
        <Nav variant="tabs" activeKey={activeView} onSelect={onViewChange}>
          <Nav.Item>
            <Nav.Link eventKey="cards">
              <i className="bi bi-grid-3x3-gap me-2"></i>
              {language === "fr" ? "Vue Carte" : "Card View"}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="table">
              <i className="bi bi-table me-2"></i>
              {language === "fr" ? "Vue Tableau" : "Table View"}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      )}
    </>
  );
};

export default PageHeaderCard;
