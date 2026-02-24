import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Row, Col, Card, Container } from "react-bootstrap";
import SectionSeparator from "./SectionSeparator";
import {
  FileText,
  Building2,
  Users,
  ListChecks,
  Clock,
  BarChart3,
  HardDrive,
  Archive,
  Globe,
  UserCog
} from "lucide-react";

const groupedCards = [
  {
    title: "Operations",
    cards: [
      { title: "Documents", icon: FileText, path: "/dashboard/sectionCategory" },
      { title: "Reporting", icon: BarChart3, path: "/dashboard/reporting" },
      { title: "Disk usage", icon: HardDrive, path: "/dashboard/storage" },
      { title: "Expiring", icon: Clock, path: "/dashboard/expiry" },
      { title: "Archived", icon: Archive, path: "/dashboard/archive" }
    ]
  },
  {
    title: "Administration",
    cards: [
      { title: "Accounts", icon: UserCog, path: "/dashboard/Account" },
      { title: "Statuses", icon: ListChecks, path: "/dashboard/docstatus" }
    ]
  },
  {
    title: "Locations & Structure",
    cards: [
      { title: "Countries", icon: Globe, path: "/dashboard/locations/countries" },
      { title: "Companies", icon: Building2, path: "/dashboard/locations/entities" }
    ]
  }
];

const DashboardHome = () => {
  const { onDashboardCardClick } = useOutletContext();

  useEffect(() => {
    document.body.classList.add("dashboard-home-body");
    return () => document.body.classList.remove("dashboard-home-body");
  }, []);

  return (
    <Container fluid className="dashboard-home">
      <div className="dashboard-header-sticky">
        <Row className="mb-3">
          <Col>
            <div className="dashboard-title-group">
              <h4 className="dashboard-title mb-1">Admin dashboard</h4>
              <div className="dashboard-subtitle">
                Quick access to key system areas and status snapshots.
              </div>
            </div>
          </Col>
        </Row>
      </div>
      {groupedCards.map((group) => {
        const columnsLg = Math.min(3, group.cards.length);
        const columnsSm = Math.min(2, group.cards.length);

        return (
        <div key={group.title}>
          <SectionSeparator text={group.title} />
          <Row
            className={`g-4 dashboard-home-row mb-4 row-cols-1 row-cols-sm-${columnsSm} row-cols-lg-${columnsLg}`}
          >
            {group.cards.map((card) => (
              <Col key={`${group.title}-${card.title}`}>
                <Card
                  className="h-100 dashboard-home-card"
                  style={{
                    boxShadow: "0 6px 8px 0 rgba(0, 0, 0, 0.2), 0 8px 20px 0 rgba(0, 0, 0, 0.19)",
                    borderRadius:   "10px"
                  }}
                  role={card.path ? "button" : undefined}
                  tabIndex={card.path ? 0 : undefined}
                  onClick={() => onDashboardCardClick?.(card.path)}
                  onKeyDown={(event) => {
                    if (!card.path) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onDashboardCardClick?.(card.path);
                    }
                  }}
                >
                  <Card.Body
                    className="d-flex align-items-center gap-3 p-2"
                    style={{ minHeight: "80px" }}
                  >
                    <div className="dashboard-card-icon">
                      <card.icon size={20} className="text-primary" />
                    </div>
                    <div className="fw-semibold text-capitalize">
                      {card.title}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        );
      })}
    </Container>
  );
};

export default DashboardHome;
