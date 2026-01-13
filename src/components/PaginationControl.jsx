/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from 'react'
import { Pagination, Form } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

const PaginationControl = ({
  totalPages = 0,
  totalElements = 0,
  pageParam = 'page',
  sizeParam = 'size',
  sizeOptions = [1, 2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 50, 100]
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, language } = useLanguage()

  const page = parseInt(searchParams.get(pageParam) || '0', 10)
  const size = parseInt(
    searchParams.get(sizeParam) || String(sizeOptions[0]),
    10
  )

  const currentPageOneBased = Math.max(1, page + 1)
  const lastPage = totalPages > 0 ? totalPages : 0

  const createPages = () => {
    if (lastPage === 0) return []

    const pages = []
    const cur = currentPageOneBased
    const left = Math.max(1, cur - 2)
    const right = Math.min(lastPage, cur + 2)

    // left side
    if (left > 1) {
      pages.push(1)
      if (left > 2) pages.push('left-ellipsis')
    }

    // middle
    for (let i = left; i <= right; i++) {
      pages.push(i)
    }

    // right side
    if (right < lastPage) {
      if (right < lastPage - 1) pages.push('right-ellipsis')
      pages.push(lastPage)
    }

    return pages
  }

  const pages = useMemo(createPages, [page, totalPages])

  const updateParams = (newPageZeroBased, newSize) => {
    const params = new URLSearchParams(searchParams)
    params.set(pageParam, String(Math.max(0, newPageZeroBased)))
    params.set(sizeParam, String(newSize))
    setSearchParams(params, { replace: true })
  }

  const gotoPageOneBased = oneBased => {
    updateParams(oneBased - 1, size)
  }

  const changeSize = e => {
    const newSize = parseInt(e.target.value, 10)
    updateParams(0, newSize)
  }

  // Format numbers according to locale
  const formatNumber = num => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US').format(
      num
    )
  }

  return (
    <div className='d-flex justify-content-between align-items-center mt-3'>
      <div>
        <small className='text-muted'>
          {/* Option 1: Simple format */}
          {t('pagination.page')}{' '}
          <strong>{formatNumber(currentPageOneBased)}</strong>{' '}
          {t('pagination.of')} <strong>{formatNumber(lastPage)}</strong> —{' '}
          <strong>{formatNumber(totalElements)}</strong> {t('pagination.items')}
          {/* Option 2: Showing X-Y of Z items (uncomment if you prefer this) */}
          {/*
          {t('pagination.showing')}{' '}
          <strong>{formatNumber(startItem)}-{formatNumber(endItem)}</strong>{' '}
          {t('pagination.of')}{' '}
          <strong>{formatNumber(totalElements)}</strong>{' '}
          {t('pagination.items')}
          */}
        </small>
      </div>

      <div className='d-flex align-items-center gap-2'>
        <Pagination className='mb-0'>
          {/* Previous Button */}
          <Pagination.Prev
            aria-label={t('pagination.ariaLabels.previousPage')}
            disabled={page <= 0}
            onClick={() =>
              gotoPageOneBased(Math.max(1, currentPageOneBased - 1))}
          />

          {/* Page Numbers */}
          {pages.map(
            (p, idx) =>
              typeof p === 'string'
                ? <Pagination.Ellipsis
                  key={`${p}-${idx}`}
                  disabled
                  aria-label={t('pagination.ariaLabels.ellipsis')}
                  />
                : <Pagination.Item
                  key={p}
                  active={p === currentPageOneBased}
                  onClick={() => gotoPageOneBased(p)}
                  aria-label={
                      p === currentPageOneBased
                        ? t('pagination.ariaLabels.currentPage', { page: p })
                        : t('pagination.ariaLabels.gotoPage', { page: p })
                    }
                  aria-current={
                      p === currentPageOneBased ? 'page' : undefined
                    }
                  >
                  {formatNumber(p)}
                </Pagination.Item>
          )}

          {/* Next Button */}
          <Pagination.Next
            aria-label={t('pagination.ariaLabels.nextPage')}
            disabled={page >= lastPage - 1}
            onClick={() =>
              gotoPageOneBased(Math.min(lastPage, currentPageOneBased + 1))}
          />
        </Pagination>

        {/* Page Size Selector */}
        <Form.Select
          size='sm'
          value={String(size)}
          onChange={changeSize}
          style={{ width: 'auto' }}
          aria-label={t('pagination.ariaLabels.pageSize')}
        >
          {sizeOptions.map(s =>
            <option key={s} value={s}>
              {formatNumber(s)} {t('pagination.perPage')}
            </option>
          )}
        </Form.Select>
      </div>
    </div>
  )
}

export default PaginationControl
