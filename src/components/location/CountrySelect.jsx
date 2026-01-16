import React, { useState, useEffect, useRef } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Form, Spinner } from 'react-bootstrap';
import { getAllCountries } from '../../services/GetRequests';
import { useLanguage } from '../../i18n/LanguageContext';

const CountrySelect = ({ value, onChange, required = false }) => {
  const { t, language } = useLanguage();
  
  const [query, setQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);

  // Load countries based on query
  useEffect(() => {
    const searchCountries = async (searchQuery) => {
      if (searchQuery.length < 2) {
        setCountries([]);
        return;
      }

      setLoading(true);
      try {
        const response = await getAllCountries({
          page: 0,
          size: 50,
          search: searchQuery
        });
        setCountries(response.data || []);
      } catch (error) {
        console.error('Error searching countries:', error);
      } finally {
        setLoading(false);
      }
    };

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Debounce search
    searchTimeout.current = setTimeout(() => {
      searchCountries(query);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  // Set selected country when value changes
  useEffect(() => {
    if (value && countries.length > 0) {
      const country = countries.find(c => c.id === value);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [value, countries]);

  const handleSelect = (country) => {
    setSelectedCountry(country);
    onChange(country.id);
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {t('entities.country')} {required && '*'}
      </Form.Label>
      
      <Combobox value={selectedCountry} onChange={handleSelect}>
        <div className="relative">
          <ComboboxInput
            as={Form.Control}
            displayValue={(country) => country?.name || ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === 'fr' ? 'Tapez pour rechercher...' : 'Type to search...'}
            className="w-full"
            autoComplete="off"
          />
          
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Spinner animation="border" size="sm" />
            </div>
          )}
        </div>
        
        <ComboboxOptions 
          anchor="bottom" 
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {filteredCountries.length === 0 && query !== '' && !loading ? (
            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
              {language === 'fr' ? 'Aucun pays trouvé' : 'No countries found'}
            </div>
          ) : (
            filteredCountries.map((country) => (
              <ComboboxOption
                key={country.id}
                value={country}
                className={({ active, selected }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  } ${selected ? 'bg-blue-50' : ''}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {country.name}
                      {country.isoCode && (
                        <span className="text-gray-500 text-sm ml-2">({country.isoCode})</span>
                      )}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        ✓
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
      
      {/* Hidden input for form submission */}
      <input type="hidden" name="countryId" value={selectedCountry?.id || ''} />
    </Form.Group>
  );
};

export default CountrySelect;