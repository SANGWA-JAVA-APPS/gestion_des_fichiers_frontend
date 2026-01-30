import React from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import HeaderTitle from '../HeaderTitle'
import SimpleSearchComponent from '../SimpleSearchComponent'
import UserComponent from '../UserComponent'

const UsersPage = () => {
  return (
    <div className='users-page'>
      <Row className='mb-4'>
        <Col>
          <Card>
            <Card.Header>
              <Row className='align-items-center'>
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>Users</HeaderTitle>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <SimpleSearchComponent showDateRange={false} />
              <UserComponent embedded />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UsersPage
