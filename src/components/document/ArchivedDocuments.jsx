import React from 'react'
import { Row, Col, Card, Alert } from 'react-bootstrap'
import HeaderTitle from '../HeaderTitle'
import SimpleSearchComponent from '../SimpleSearchComponent'

const ArchivedDocuments = () => {
  return (
    <div className='archived-documents'>
      <Row className='mb-4'>
        <Col>
          <Card>
            <Card.Header>
              <Row className='align-items-center'>
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>Archived Documents</HeaderTitle>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <SimpleSearchComponent showDateRange={false} />
              <Alert variant='info' className='mb-0 d-none'>
                <strong>Coming Soon:</strong> Archive management tools will be
                available here.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ArchivedDocuments
