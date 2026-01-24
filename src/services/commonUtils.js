// Mapping of 3-character ISO codes to 2-character codes for flag display
const isoCodeMap = {
  'RWA': 'rw', // Rwanda
  'BDI': 'bi', // Burundi
  'COD': 'cd', // DR Congo
  'TZA': 'tz', // Tanzania
  'UGA': 'ug', // Uganda
  'KEN': 'ke', // Kenya
  // Add more mappings as needed
}

export const getFlagUrl = isoCode => {
  if (!isoCode) return null
  
  // Convert 3-character ISO code to 2-character if needed
  const code = isoCode.length === 3 
    ? (isoCodeMap[isoCode.toUpperCase()] || isoCode.substring(0, 2))
    : isoCode
  
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`
}
