import React, { useState } from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';

const SearchComponent = ({
  // Dropdown configuration
  dropdownLabel = 'Filter',
  dropdownItems = [],
  dropdownValue = '',
  onDropdownChange = () => {},
  
  // Textbox 1 configuration
  textbox1Label = 'Search',
  textbox1Placeholder = 'Enter search term...',
  textbox1Value = '',
  onTextbox1Change = () => {},
  
  // Textbox 2 configuration
  textbox2Label = 'Field 2',
  textbox2Placeholder = 'Enter value...',
  textbox2Value = '',
  onTextbox2Change = () => {},
  
  // Textbox 3 configuration
  textbox3Label = 'Field 3',
  textbox3Placeholder = 'Enter value...',
  textbox3Value = '',
  onTextbox3Change = () => {},
  
  // Date range configuration
  dateStartLabel = 'Start Date',
  dateStartValue = '',
  onDateStartChange = () => {},
  
  dateEndLabel = 'End Date',
  dateEndValue = '',
  onDateEndChange = () => {},
  
  // Search button configuration
  onSearch = () => {},
  searchButtonText = 'Search',
  
  // Optional: Show/hide specific fields
  showDropdown = true,
  showTextbox1 = true,
  showTextbox2 = false,
  showTextbox3 = false,
  showDateRange = true
}) => {
  
  const handleSearch = () => {
    const searchData = {
      dropdown: dropdownValue,
      textbox1: textbox1Value,
      textbox2: textbox2Value,
      textbox3: textbox3Value,
      dateStart: dateStartValue,
      dateEnd: dateEndValue
    };
    onSearch(searchData);
  };

  return (
    <div className="search-component bg-light p-3 rounded mb-3">
      <Row className="g-2 align-items-end">
        {/* Dropdown */}
        {showDropdown && (
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className="small mb-1">{dropdownLabel}</Form.Label>
              <Form.Select 
                size="sm"
                value={dropdownValue}
                onChange={(e) => onDropdownChange(e.target.value)}
              >
                <option value="">All</option>
                {dropdownItems.map((item, index) => (
                  <option key={index} value={item.value || item}>
                    {item.label || item}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {/* Textbox 1 */}
        {showTextbox1 && (
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className="small mb-1">{textbox1Label}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={textbox1Placeholder}
                value={textbox1Value}
                onChange={(e) => onTextbox1Change(e.target.value)}
              />
            </Form.Group>
          </Col>
        )}

        {/* Textbox 2 */}
        {showTextbox2 && (
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className="small mb-1">{textbox2Label}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={textbox2Placeholder}
                value={textbox2Value}
                onChange={(e) => onTextbox2Change(e.target.value)}
              />
            </Form.Group>
          </Col>
        )}

        {/* Textbox 3 */}
        {showTextbox3 && (
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className="small mb-1">{textbox3Label}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={textbox3Placeholder}
                value={textbox3Value}
                onChange={(e) => onTextbox3Change(e.target.value)}
              />
            </Form.Group>
          </Col>
        )}

        {/* Date Start */}
        {showDateRange && (
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className="small mb-1">{dateStartLabel}</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={dateStartValue}
                onChange={(e) => onDateStartChange(e.target.value)}
              />
            </Form.Group>
          </Col>
        )}

        {/* Date End */}
        {showDateRange && (
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className="small mb-1">{dateEndLabel}</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={dateEndValue}
                onChange={(e) => onDateEndChange(e.target.value)}
              />
            </Form.Group>
          </Col>
        )}

        {/* Search Button */}
        <Col xs={12} md={6} lg={2}>
          <Button 
            variant="primary" 
            size="sm" 
            className="w-100"
            onClick={handleSearch}
          >
            <i className="fas fa-search me-2"></i>
            {searchButtonText}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default SearchComponent;
