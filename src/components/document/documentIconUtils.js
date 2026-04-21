import pdfIcon from '../../assets/documents_icons/pdf.png'
import excelIcon from '../../assets/documents_icons/excel.png'
import wordIcon from '../../assets/documents_icons/word.png'
import powerpointIcon from '../../assets/documents_icons/powerpoint.png'

/**
 * Returns the appropriate icon for a document based on its file extension or content type.
 * Supports PDF, Excel, Word, and PowerPoint (including OpenDocument variants).
 */
export const getDocumentIcon = (document) => {
  if (!document) return null

  const fileName = (document.originalFileName || document.fileName || '').toLowerCase()
  const contentType = (document.contentType || '').toLowerCase()

  // PDF
  if (fileName.endsWith('.pdf') || contentType.includes('pdf')) {
    return pdfIcon
  }

  // Excel and OpenDocument spreadsheets
  if (
    fileName.endsWith('.xls') || fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xlsm') || fileName.endsWith('.xlsb') ||
    fileName.endsWith('.xltx') || fileName.endsWith('.xltm') ||
    fileName.endsWith('.csv') || fileName.endsWith('.tsv') ||
    fileName.endsWith('.ods') ||
    contentType.includes('spreadsheet') || contentType.includes('excel') ||
    contentType.includes('opendocument.spreadsheet')
  ) {
    return excelIcon
  }

  // Word and OpenDocument text files
  if (
    fileName.endsWith('.doc') || fileName.endsWith('.docx') ||
    fileName.endsWith('.docm') || fileName.endsWith('.dotx') ||
    fileName.endsWith('.dotm') || fileName.endsWith('.rtf') ||
    fileName.endsWith('.odt') ||
    contentType.includes('word') || contentType.includes('rtf') ||
    contentType.includes('opendocument.text') || contentType.includes('document')
  ) {
    return wordIcon
  }

  // PowerPoint and OpenDocument presentations
  if (
    fileName.endsWith('.ppt') || fileName.endsWith('.pptx') ||
    fileName.endsWith('.pptm') || fileName.endsWith('.potx') ||
    fileName.endsWith('.potm') || fileName.endsWith('.ppsx') ||
    fileName.endsWith('.ppsm') || fileName.endsWith('.odp') ||
    contentType.includes('presentation') || contentType.includes('powerpoint') ||
    contentType.includes('opendocument.presentation')
  ) {
    return powerpointIcon
  }

  return null
}
