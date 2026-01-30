import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  FaThLarge, 
  FaUsers, 
  FaUser, 
  FaUserTag, 
  FaFileAlt, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaBuilding, 
  FaCubes, 
  FaLayerGroup,
  FaArchive,
  FaClock,
  FaCheckCircle,
  FaCog
} from 'react-icons/fa';
import AdminCArdmenu from './AdminCArdmenu';
import { getText } from '../data/texts';

const MenuBox = ({ setActiveTab, language = 'en' }) => {
  const handleDocumentClick = () => {
    setActiveTab('document');
  };
  
  return (
    <Row className="g-4 mt-4">
      <Col xs={12}>
        <h4 className="mb-3">{getText('adminMenu.systemNavigation', language)}</h4>
      </Col>
      
      {/* Main Sections */}
      {/* <AdminCArdmenu title={getText('adminMenu.dashboard', language)} icon={FaThLarge} iconColor="#0d6efd" onClick={() => setActiveTab('overview')} /> */}
      <AdminCArdmenu title={getText('adminMenu.documents', language)} icon={FaFileAlt} iconColor="#28a745" onClick={handleDocumentClick} />
      <AdminCArdmenu title={getText('adminMenu.archive', language)} icon={FaArchive} iconColor="#6c757d" onClick={() => setActiveTab('archive')} />
      <AdminCArdmenu title={getText('adminMenu.expiringSoon', language)} icon={FaClock} iconColor="#ffc107" onClick={() => setActiveTab('expiry')} />
      <AdminCArdmenu title={getText('adminMenu.activeDocs', language)} icon={FaCheckCircle} iconColor="#28a745" onClick={() => setActiveTab('activeDocs')} />
      
      {/* User Management */}
      {/* <Col xs={12} className="mt-3">
        <h5 className="mb-3 text-muted">{getText('adminMenu.userManagement', language)}</h5>
      </Col> */}
      <AdminCArdmenu title={getText('adminMenu.userAccounts', language)} icon={FaUser} iconColor="#0d6efd" onClick={() => setActiveTab('account')} />
      <AdminCArdmenu title={getText('adminMenu.userRoles', language)} icon={FaUserTag} iconColor="#6610f2" onClick={() => setActiveTab('roles')} />
      
      {/* Location Management */}
      {/* <Col xs={12} className="mt-3">
        <h5 className="mb-3 text-muted">{getText('adminMenu.locationManagement', language)}</h5>
      </Col> */}
      <AdminCArdmenu title={getText('adminMenu.countries', language)} icon={FaGlobe} iconColor="#17a2b8" onClick={() => setActiveTab('country-list')} />
      <AdminCArdmenu title={getText('adminMenu.entities', language)} icon={FaBuilding} iconColor="#20c997" onClick={() => setActiveTab('entity-list')} />
      <AdminCArdmenu title={getText('adminMenu.modules', language)} icon={FaCubes} iconColor="#0d6efd" onClick={() => setActiveTab('modules-list')} />
      <AdminCArdmenu title={getText('adminMenu.sections', language)} icon={FaLayerGroup} iconColor="#28a745" onClick={() => setActiveTab('sections-list')} />
      
      {/* System Settings */}
      {/* <Col xs={12} className="mt-3">
        <h5 className="mb-3 text-muted">{getText('adminMenu.systemSettings', language)}</h5>
      </Col> */}
      <AdminCArdmenu title={getText('adminMenu.systemConfig', language)} icon={FaCog} iconColor="#fd7e14" onClick={() => setActiveTab('roles')} />
    </Row>
  );
};

export default MenuBox;
