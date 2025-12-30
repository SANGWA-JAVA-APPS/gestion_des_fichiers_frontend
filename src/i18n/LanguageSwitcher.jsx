import { Form } from 'react-bootstrap'
import { useLanguage } from '../i18n/LanguageContext'

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage()

  const handleChange = e => {
    setLanguage(e.target.value)
  }

  return (
    <Form.Select
      size='sm'
      value={language}
      onChange={handleChange}
      style={{ width: '90px' }}
    >
      <option value='en'>EN</option>
      <option value='fr'>FR</option>
    </Form.Select>
  )
}

export default LanguageSwitcher
