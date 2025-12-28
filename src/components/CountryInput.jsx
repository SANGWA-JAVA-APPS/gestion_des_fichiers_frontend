import React, { useEffect, useRef } from 'react'
import $ from 'jquery'
import 'country-select-js/build/js/countrySelect.min.js'
import 'country-select-js/build/css/countrySelect.css'
import { countries as countryList } from 'country-data-list'

const CountryInput = ({ value = '', onChange }) => {
  const inputRef = useRef(null)

  useEffect(
    () => {
      const $input = $(inputRef.current)

      $input.countrySelect({
        defaultCountry: 'rw',
        responsiveDropdown: true
      })

      if (value) {
        $input.countrySelect('setCountry', value)
      }

      $input.on('change', () => {
        let countryData = $input.countrySelect('getSelectedCountryData')

        // Enrich with data from country-data-list
        const additionalData = countryList[countryData.iso2.toUpperCase()]
        if (additionalData) {
          countryData = {
            ...countryData,
            dialCode: additionalData.countryCallingCodes[0] || '',
            emoji: additionalData.emoji || ''
          }
        }

        console.log('Selected country:', countryData)
        onChange(countryData)
      })

      return () => {
        $input.countrySelect('destroy')
      }
    },
    [value, onChange]
  )

  return <input type='text' ref={inputRef} className='form-control' />
}

export default CountryInput
