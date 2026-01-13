/* eslint-disable react-hooks/exhaustive-deps */
import { Row, Col, Form, Button } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'


const SimpleSearchComponent = ({
  dropdownLabel,
  dropdownItems = [],

  textbox1Label,
  textbox1Placeholder,

  showDropdown = true,
  showTextbox1 = true,
  showTextbox2 = false,
  showTextbox3 = false,
  showDateRange = true,

  paramNames = {
    dropdown: 'filter',
    textbox1: 'search',
    textbox2: 'f2',
    textbox3: 'f3',
    dateStart: 'start',
    dateEnd: 'end'
  },

  searchButtonText,
  clearButtonText
}) => {
  const { t, language } = useLanguage() // Get translation function and current language
  const [searchParams, setSearchParams] = useSearchParams()

  const [values, setValues] = useState({
    dropdown: '',
    textbox1: '',
    textbox2: '',
    textbox3: '',
    dateStart: '',
    dateEnd: ''
  })

  // 🔥 FIRST RENDER → clear params this component manages
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    setSearchParams(params)
  }, [])

  // 🔥 Sync FROM URL → UI (back/forward safe)
  useEffect(() => {
    setValues({
      dropdown: searchParams.get(paramNames.dropdown) || '',
      textbox1: searchParams.get(paramNames.textbox1) || '',
      textbox2: searchParams.get(paramNames.textbox2) || '',
      textbox3: searchParams.get(paramNames.textbox3) || '',
      dateStart: searchParams.get(paramNames.dateStart) || '',
      dateEnd: searchParams.get(paramNames.dateEnd) || ''
    })
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)

    Object.entries(paramNames).forEach(([field, param]) => {
      const value = values[field]
      if (value) params.set(param, value)
      else params.delete(param)
    })

    setSearchParams(params)
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams)
    Object.values(paramNames).forEach(p => params.delete(p))
    params.set('page', '0')
    setSearchParams(params)
  }

  return (
    <div className="bg-light p-3 rounded mb-3">
      <Row className="g-2 align-items-end">
        {showDropdown && (
          <Col lg={2}>
            <Form.Label className="small">
              {dropdownLabel || t('simpleSearch.dropdownLabel')}
            </Form.Label>
            <Form.Select
              size="sm"
              value={values.dropdown}
              onChange={e =>
                setValues(v => ({ ...v, dropdown: e.target.value }))
              }
            >
              <option value="">{t('simpleSearch.allOption')}</option>
              {dropdownItems.map(i => (
                <option key={i.value || i} value={i.value || i}>
                  {i.label || i}
                </option>
              ))}
            </Form.Select>
          </Col>
        )}

        {showTextbox1 && (
          <Col lg={2}>
            <Form.Label className="small">
              {textbox1Label || t('simpleSearch.textbox1Label')}
            </Form.Label>
            <Form.Control
              size="sm"
              placeholder={textbox1Placeholder || t('simpleSearch.textbox1Placeholder')}
              value={values.textbox1}
              onChange={e =>
                setValues(v => ({ ...v, textbox1: e.target.value }))
              }
            />
          </Col>
        )}

        {showDateRange && (
          <>
            <Col lg={2}>
              <Form.Label className="small">{t('simpleSearch.startDate')}</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={values.dateStart}
                onChange={e =>
                  setValues(v => ({ ...v, dateStart: e.target.value }))
                }
              />
            </Col>

            <Col lg={2}>
              <Form.Label className="small">{t('simpleSearch.endDate')}</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={values.dateEnd}
                onChange={e =>
                  setValues(v => ({ ...v, dateEnd: e.target.value }))
                }
              />
            </Col>
          </>
        )}

        <Col lg={2} className="d-flex gap-2">
          <Button size="sm" className="w-100" onClick={handleSearch}>
            {searchButtonText || t('simpleSearch.searchButton')}
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            className="w-100"
            onClick={handleClear}
          >
            {clearButtonText || t('simpleSearch.clearButton')}
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default SimpleSearchComponent