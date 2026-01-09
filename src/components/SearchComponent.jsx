/* eslint-disable react-hooks/exhaustive-deps */
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

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
  showDateRange = true,

  // New: sync behavior
  syncToUrl = true,
  // paramNames allow parent components to map fields to desired query param keys
  paramNames = {
    dropdown: 'filter',
    textbox1: 'search',
    textbox2: 'f2',
    textbox3: 'f3',
    dateStart: 'start',
    dateEnd: 'end'
  },
  // whether to reset page to 0 when performing a new search
  resetPageOnSearch = true
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  // local state used when parent doesn't control the inputs
  const [localDropdown, setLocalDropdown] = useState(dropdownValue || '')
  const [localTextbox1, setLocalTextbox1] = useState(textbox1Value || '')
  const [localTextbox2, setLocalTextbox2] = useState(textbox2Value || '')
  const [localTextbox3, setLocalTextbox3] = useState(textbox3Value || '')
  const [localDateStart, setLocalDateStart] = useState(dateStartValue || '')
  const [localDateEnd, setLocalDateEnd] = useState(dateEndValue || '')

  // helpers to detect controlled usage
  const isControlled = (value, onChange) => typeof onChange === 'function'

  // read initial values from URL and propagate to controlled callbacks or local state
  useEffect(() => {
    if (!syncToUrl) return

    const read = () => {
      const d = searchParams.get(paramNames.dropdown) || ''
      const t1 = searchParams.get(paramNames.textbox1) || ''
      const t2 = searchParams.get(paramNames.textbox2) || ''
      const t3 = searchParams.get(paramNames.textbox3) || ''
      const s = searchParams.get(paramNames.dateStart) || ''
      const e = searchParams.get(paramNames.dateEnd) || ''

      if (isControlled(dropdownValue, onDropdownChange)) {
        if (d) onDropdownChange(d)
      } else {
        setLocalDropdown(d)
      }

      if (isControlled(textbox1Value, onTextbox1Change)) {
        if (t1) onTextbox1Change(t1)
      } else {
        setLocalTextbox1(t1)
      }

      if (isControlled(textbox2Value, onTextbox2Change)) {
        if (t2) onTextbox2Change(t2)
      } else {
        setLocalTextbox2(t2)
      }

      if (isControlled(textbox3Value, onTextbox3Change)) {
        if (t3) onTextbox3Change(t3)
      } else {
        setLocalTextbox3(t3)
      }

      if (isControlled(dateStartValue, onDateStartChange)) {
        if (s) onDateStartChange(s)
      } else {
        setLocalDateStart(s)
      }

      if (isControlled(dateEndValue, onDateEndChange)) {
        if (e) onDateEndChange(e)
      } else {
        setLocalDateEnd(e)
      }
    }

    read()
  }, [])

  // update local state when parent prop values change (keep in sync for uncontrolled fallback)
  useEffect(
    () => {
      if (!isControlled(dropdownValue, onDropdownChange)) {
        setLocalDropdown(dropdownValue || '')
      }
    },
    [dropdownValue]
  )
  useEffect(
    () => {
      if (!isControlled(textbox1Value, onTextbox1Change)) {
        setLocalTextbox1(textbox1Value || '')
      }
    },
    [textbox1Value]
  )
  useEffect(
    () => {
      if (!isControlled(textbox2Value, onTextbox2Change)) {
        setLocalTextbox2(textbox2Value || '')
      }
    },
    [textbox2Value]
  )
  useEffect(
    () => {
      if (!isControlled(textbox3Value, onTextbox3Change)) {
        setLocalTextbox3(textbox3Value || '')
      }
    },
    [textbox3Value]
  )
  useEffect(
    () => {
      if (!isControlled(dateStartValue, onDateStartChange)) {
        setLocalDateStart(dateStartValue || '')
      }
    },
    [dateStartValue]
  )
  useEffect(
    () => {
      if (!isControlled(dateEndValue, onDateEndChange)) {
        setLocalDateEnd(dateEndValue || '')
      }
    },
    [dateEndValue]
  )

  const currentDropdown = isControlled(dropdownValue, onDropdownChange)
    ? dropdownValue
    : localDropdown
  const currentTextbox1 = isControlled(textbox1Value, onTextbox1Change)
    ? textbox1Value
    : localTextbox1
  const currentTextbox2 = isControlled(textbox2Value, onTextbox2Change)
    ? textbox2Value
    : localTextbox2
  const currentTextbox3 = isControlled(textbox3Value, onTextbox3Change)
    ? textbox3Value
    : localTextbox3
  const currentDateStart = isControlled(dateStartValue, onDateStartChange)
    ? dateStartValue
    : localDateStart
  const currentDateEnd = isControlled(dateEndValue, onDateEndChange)
    ? dateEndValue
    : localDateEnd

  const handleSearch = () => {
    const searchData = {
      dropdown: currentDropdown,
      textbox1: currentTextbox1,
      textbox2: currentTextbox2,
      textbox3: currentTextbox3,
      dateStart: currentDateStart,
      dateEnd: currentDateEnd
    }

    // call callback for backwards compatibility
    onSearch(searchData)

    if (!syncToUrl) return

    // update URL search params while preserving other params
    const params = new URLSearchParams(searchParams)

    const setOrDelete = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      } else params.delete(key)
    }

    setOrDelete(paramNames.dropdown, searchData.dropdown)
    setOrDelete(paramNames.textbox1, searchData.textbox1)
    setOrDelete(paramNames.textbox2, searchData.textbox2)
    setOrDelete(paramNames.textbox3, searchData.textbox3)
    setOrDelete(paramNames.dateStart, searchData.dateStart)
    setOrDelete(paramNames.dateEnd, searchData.dateEnd)

    if (resetPageOnSearch) params.set('page', '0')

    setSearchParams(params)
  }

  // handlers for on-change that respect controlled/uncontrolled pattern
  const handleDropdownChange = val => {
    if (isControlled(dropdownValue, onDropdownChange)) onDropdownChange(val)
    else setLocalDropdown(val)
  }
  const handleTextbox1Change = val => {
    if (isControlled(textbox1Value, onTextbox1Change)) onTextbox1Change(val)
    else setLocalTextbox1(val)
  }
  const handleTextbox2Change = val => {
    if (isControlled(textbox2Value, onTextbox2Change)) onTextbox2Change(val)
    else setLocalTextbox2(val)
  }
  const handleTextbox3Change = val => {
    if (isControlled(textbox3Value, onTextbox3Change)) onTextbox3Change(val)
    else setLocalTextbox3(val)
  }
  const handleDateStartChange = val => {
    if (isControlled(dateStartValue, onDateStartChange)) onDateStartChange(val)
    else setLocalDateStart(val)
  }
  const handleDateEndChange = val => {
    if (isControlled(dateEndValue, onDateEndChange)) onDateEndChange(val)
    else setLocalDateEnd(val)
  }

  return (
    <div className='search-component bg-light p-3 rounded mb-3'>
      <Row className='g-2 align-items-end'>
        {/* Dropdown */}
        {showDropdown &&
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className='small mb-1'>
                {dropdownLabel}
              </Form.Label>
              <Form.Select
                size='sm'
                value={currentDropdown}
                onChange={e => handleDropdownChange(e.target.value)}
              >
                <option value=''>All</option>
                {dropdownItems.map((item, index) =>
                  <option key={index} value={item.value || item}>
                    {item.label || item}
                  </option>
                )}
              </Form.Select>
            </Form.Group>
          </Col>}

        {/* Textbox 1 */}
        {showTextbox1 &&
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className='small mb-1'>
                {textbox1Label}
              </Form.Label>
              <Form.Control
                type='text'
                size='sm'
                placeholder={textbox1Placeholder}
                value={currentTextbox1}
                onChange={e => handleTextbox1Change(e.target.value)}
              />
            </Form.Group>
          </Col>}

        {/* Textbox 2 */}
        {showTextbox2 &&
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className='small mb-1'>
                {textbox2Label}
              </Form.Label>
              <Form.Control
                type='text'
                size='sm'
                placeholder={textbox2Placeholder}
                value={currentTextbox2}
                onChange={e => handleTextbox2Change(e.target.value)}
              />
            </Form.Group>
          </Col>}

        {/* Textbox 3 */}
        {showTextbox3 &&
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className='small mb-1'>
                {textbox3Label}
              </Form.Label>
              <Form.Control
                type='text'
                size='sm'
                placeholder={textbox3Placeholder}
                value={currentTextbox3}
                onChange={e => handleTextbox3Change(e.target.value)}
              />
            </Form.Group>
          </Col>}

        {/* Date Start */}
        {showDateRange &&
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className='small mb-1'>
                {dateStartLabel}
              </Form.Label>
              <Form.Control
                type='date'
                size='sm'
                value={currentDateStart}
                onChange={e => handleDateStartChange(e.target.value)}
              />
            </Form.Group>
          </Col>}

        {/* Date End */}
        {showDateRange &&
          <Col xs={12} md={6} lg={2}>
            <Form.Group>
              <Form.Label className='small mb-1'>
                {dateEndLabel}
              </Form.Label>
              <Form.Control
                type='date'
                size='sm'
                value={currentDateEnd}
                onChange={e => handleDateEndChange(e.target.value)}
              />
            </Form.Group>
          </Col>}

        {/* Search Button */}
        <Col xs={12} md={6} lg={2}>
          <Button
            variant='primary'
            size='sm'
            className='w-100'
            onClick={handleSearch}
          >
            <i className='fas fa-search me-2' />
            {searchButtonText}
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default SearchComponent
