const REGIONAL_INDICATOR_OFFSET = 127397;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

export function getFlagEmoji(countryCode: string): string {
  const normalizedCode = countryCode.trim().toUpperCase();

  if (!COUNTRY_CODE_PATTERN.test(normalizedCode)) {
    return '🏳️';
  }

  return normalizedCode
    .split('')
    .map((letter) => String.fromCodePoint(REGIONAL_INDICATOR_OFFSET + letter.charCodeAt(0)))
    .join('');
}
