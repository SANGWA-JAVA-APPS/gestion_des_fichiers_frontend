import React from 'react'
import { Row, Col, Card, Alert } from 'react-bootstrap'
import HeaderTitle from '../HeaderTitle'
import SimpleSearchComponent from '../SimpleSearchComponent'

const ExpiringDocuments = () => {
  return (
    <div className='expiring-documents'>
      <Row className='mb-4'>
        <Col>
          <Card>
            <Card.Header>
              <Row className='align-items-center'>
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>Expiring Documents</HeaderTitle>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <SimpleSearchComponent />

              <Alert variant='warning' className='mb-0 d-none'>
                <strong>Coming Soon:</strong> Expiry tracking and filters will
                appear here.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ExpiringDocuments
