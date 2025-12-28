export const getFlagUrl = isoCode =>
  isoCode ? `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png` : null
