// usValidator.ts - Validation utility for NANP phone numbers and US State ZIP codes

/**
 * Validates a US phone number against standard NANP rules:
 * - Exactly 10 digits (after stripping non-numeric characters)
 * - Area Code (NPA) cannot start with 0 or 1
 * - Exchange Code (NXX) cannot start with 0 or 1
 */
export function validateNanpPhone(phoneStr: string): boolean {
  const digits = phoneStr.replace(/\D/g, '');
  
  if (digits.length !== 10) {
    return false;
  }

  const npa = digits.slice(0, 3);
  const nxx = digits.slice(3, 6);

  // First digit of NPA and NXX must be between 2 and 9
  if (npa[0] === '0' || npa[0] === '1' || nxx[0] === '0' || nxx[0] === '1') {
    return false;
  }

  // NXX cannot be in the 555-01xx test range or similar invalid patterns if strict checking is needed
  return true;
}

// Official 3-digit ZIP code prefix ranges mapped to US state abbreviations
export const STATE_ZIP_RANGES: Record<string, [number, number][]> = {
  AL: [[350, 369]],
  AK: [[995, 999]],
  AZ: [[850, 865]],
  AR: [[716, 729]],
  CA: [[900, 961]],
  CO: [[800, 816]],
  CT: [[60, 69]],
  DE: [[197, 199]],
  FL: [[320, 349]],
  GA: [[300, 319], [398, 399]],
  HI: [[967, 968]],
  ID: [[832, 838]],
  IL: [[600, 629]],
  IN: [[460, 479]],
  IA: [[500, 528]],
  KS: [[660, 679]],
  KY: [[400, 427]],
  LA: [[700, 714]],
  ME: [[39, 49]],
  MD: [[206, 219]],
  MA: [[10, 27], [55, 55]],
  MI: [[480, 499]],
  MN: [[550, 567]],
  MS: [[386, 397]],
  MO: [[630, 658]],
  MT: [[590, 599]],
  NE: [[680, 693]],
  NV: [[889, 898]],
  NH: [[30, 38]],
  NJ: [[70, 89]],
  NM: [[870, 884]],
  NY: [[100, 149]],
  NC: [[270, 289]],
  ND: [[580, 588]],
  OH: [[430, 458]],
  OK: [[730, 749]],
  OR: [[970, 979]],
  PA: [[150, 196]],
  RI: [[28, 29]],
  SC: [[290, 299]],
  SD: [[570, 577]],
  TN: [[370, 385]],
  TX: [[750, 799]],
  UT: [[840, 847]],
  VT: [[50, 59]],
  VA: [[201, 246]],
  WA: [[980, 994]],
  WV: [[247, 268]],
  WI: [[530, 549]],
  WY: [[820, 831]],
  DC: [[200, 205]]
};

/**
 * Validates that a given 5-digit ZIP code structurally belongs to the specified US State.
 */
export function validateStateZip(zipCode: string, stateAbbr: string): boolean {
  const cleanZip = zipCode.replace(/\D/g, '');
  if (cleanZip.length !== 5) {
    return false;
  }

  const prefix = parseInt(cleanZip.slice(0, 3), 10);
  const ranges = STATE_ZIP_RANGES[stateAbbr.toUpperCase()];

  if (!ranges) {
    return false;
  }

  for (const [min, max] of ranges) {
    if (prefix >= min && prefix <= max) {
      return true;
    }
  }

  return false;
}
