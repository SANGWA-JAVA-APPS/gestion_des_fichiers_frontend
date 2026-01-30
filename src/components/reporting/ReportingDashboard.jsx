import React, { useEffect, useMemo, useState } from 'react'
import { Row, Col, Card, Form, Button, Badge } from 'react-bootstrap'
import HeaderTitle from '../HeaderTitle'
import SimpleSearchComponent from '../SimpleSearchComponent'
import { getReportingDocumentTypeCounts, getReportingFileStatusCounts, getReportingSummary } from '../../services/GetRequests'

const ReportingDashboard = () => {
  const [summary, setSummary] = useState(null)
  const [docTypeCounts, setDocTypeCounts] = useState([])
  const [fileStatusCounts, setFileStatusCounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReporting = async () => {
      try {
        const [summaryData, docTypes, statusCounts] = await Promise.all([
          getReportingSummary(100),
          getReportingDocumentTypeCounts(),
          getReportingFileStatusCounts()
        ])
        setSummary(summaryData)
        setDocTypeCounts(Array.isArray(docTypes) ? docTypes : [])
        setFileStatusCounts(Array.isArray(statusCounts) ? statusCounts : [])
      } catch (error) {
        console.error('Failed to load reporting data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReporting()
  }, [])

  const summaryCards = useMemo(() => (
    [
      { label: 'Countries', value: summary?.totalCountries },
      { label: 'Countries w/ No Entities', value: summary?.countriesWithNoEntities },
      { label: 'Entities', value: summary?.totalEntities },
      { label: 'Files', value: summary?.totalFiles },
      { label: 'Doc Records', value: summary?.totalDocRecords },
      { label: 'Section Categories', value: summary?.totalSectionCategories }
    ]
  ), [summary])

  const docTypeRows = useMemo(() => (
    docTypeCounts.filter(item => Number(item.total) > 0)
  ), [docTypeCounts])

  const fileStatusRows = useMemo(() => (
    fileStatusCounts.filter(item => Number(item.total) > 0)
  ), [fileStatusCounts])

  const dataQualityItems = useMemo(() => ([
    {
      label: 'Documents without file link',
      value: summary?.documentsWithoutFileLink,
      variant: summary?.documentsWithoutFileLink ? 'danger' : 'success'
    },
    {
      label: 'Documents missing status',
      value: summary?.documentsMissingStatus,
      variant: summary?.documentsMissingStatus ? 'warning' : 'success'
    },
    {
      label: 'Files missing expiration',
      value: summary?.filesMissingExpiration,
      variant: summary?.filesMissingExpiration ? 'warning' : 'success'
    }
  ]), [summary])

  return (
    <div className='reporting-dashboard'>
      <Row className='mb-4'>
        <Col>
          <Card>
            <Card.Header>
              <Row className='align-items-center'>
                <Col xs={12} md={6} lg={3}>
                  <HeaderTitle>Reporting</HeaderTitle>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className='g-3 mb-3'>
                {summaryCards.map(card => (
                  <Col xs={12} sm={6} lg={4} xl={3} key={card.label}>
                    <Card className='h-100 shadow-sm border-2' style ={{border:'#5d5c8f 1px solid'}}>
                      <Card.Body className='d-flex flex-column gap-2'>
                        <span className=' ' style={{color:'#338c92',fontSize:'13px', fontWeight:'bold'}}>{card.label}</span>
                        <span className='fs-4 fw-semibold' style={{color:'#f59402'}}>
                          {loading ? '...' : (card.value ?? '-')}
                        </span>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Row className='align-items-center g-2 mb-3'>
                <Col xs={12} lg={6}>
                  <SimpleSearchComponent showDateRange />
                </Col>
                <Col xs={12} lg={6}>
                  <Row className='g-2'>
                    <Col xs={12} md={6}>
                      <Form.Select size='sm' aria-label='Filter by document status'>
                        <option value=''>Status: All</option>
                        <option value='ACTIVE'>Active</option>
                        <option value='ARCHIVED'>Archived</option>
                        <option value='EXPIRED'>Expired</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Select size='sm' aria-label='Filter by document type'>
                        <option value=''>Type: All</option>
                        <option value='norme_loi'>Norme Loi</option>
                        <option value='comm_asset_land'>Comm Asset Land</option>
                        <option value='accord_concession'>Accord Concession</option>
                        <option value='permi_construction'>Permi Construction</option>
                        <option value='estate'>Estate</option>
                        <option value='cert_licenses'>Cert Licenses</option>
                        <option value='cargo_damage'>Cargo Damage</option>
                        <option value='insurance'>Insurance</option>
                        <option value='litigation_followup'>Litigation Followup</option>
                        <option value='third_party_claims'>Third Party Claims</option>
                        <option value='equipment_id'>Equipment ID</option>
                      </Form.Select>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Row className='g-3'>
                <Col xs={12} lg={6}>
                  <Card className='h-100'>
                    <Card.Body>
                      <Card.Title className='h6'>Document Volume by Type</Card.Title>
                      {loading && (
                        <div className='text-muted small'>Loading...</div>
                      )}
                      {!loading && docTypeRows.length === 0 && (
                        <div className='text-muted small'>No document data yet.</div>
                      )}
                      {!loading && docTypeRows.map(item => (
                        <div className='text-muted small' key={item.docType}>
                          {item.docType}: <Badge bg='secondary'>{item.total}</Badge>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} lg={6}>
                  <Card className='h-100'>
                    <Card.Body>
                      <Card.Title className='h6'>File Status</Card.Title>
                      {loading && (
                        <div className='text-muted small'>Loading...</div>
                      )}
                      {!loading && fileStatusRows.length === 0 && (
                        <div className='text-muted small'>No file status data yet.</div>
                      )}
                      {!loading && fileStatusRows.map(item => (
                        <div className='text-muted small' key={item.status}>
                          {item.status}: <Badge bg='secondary'>{item.total}</Badge>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} lg={6}>
                  <Card className='h-100'>
                    <Card.Body>
                      <Card.Title className='h6'>Data Quality</Card.Title>
                      {dataQualityItems.map(item => (
                        <div className='text-muted small' key={item.label}>
                          {item.label}:{' '}
                          <Badge bg={item.variant}>
                            {loading ? '...' : (item.value ?? '-')}
                          </Badge>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className='d-flex justify-content-end mt-3'>
                <Button variant='primary' size='sm'>Export</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReportingDashboard
