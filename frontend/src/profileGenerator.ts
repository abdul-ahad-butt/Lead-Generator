import { fakerEN_US as faker } from '@faker-js/faker';
import { US_STATE_AREA_CODES } from './usStateAreaCodes';
import { validateNanpPhone, validateStateZip } from './usValidator';

export interface ProfileRecord {
  rawPhone: string;
  formattedPhone: string;
  phoneValid: boolean;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  addressValid: boolean;
}

export interface GeneratorParams {
  selectedState: string;        // e.g. "CO", "NY", "CA"
  selectedAreaCode: string;     // e.g. "303", "719", or "all"
  startingPhone?: string;       // e.g. "(303) 555-0100" or ""
  count?: number;               // Default: 100
}

/**
 * Formats a raw 10-digit phone string into standard US format: (XXX) XXX-XXXX
 */
function formatUsPhone(rawDigits: string): string {
  const clean = rawDigits.padEnd(10, '0').slice(0, 10);
  return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
}

/**
 * Generates a valid random 7-digit subscriber number (NXX-XXXX)
 * where the NXX exchange code starts with digits 2-9 per NANP rules.
 */
function generateRandomSubscriber(): string {
  // Exchange code (NXX): first digit must be 2-9
  const nxxFirst = Math.floor(Math.random() * 8) + 2;
  const nxxRest = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Subscriber digits (XXXX)
  const subscriber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${nxxFirst}${nxxRest}${subscriber}`;
}

/**
 * Main Profile Generation Loop
 */
export function generateProfiles({
  selectedState,
  selectedAreaCode,
  startingPhone = '',
  count = 100
}: GeneratorParams): ProfileRecord[] {
  const profiles: ProfileRecord[] = [];
  const stateAreaCodes = US_STATE_AREA_CODES[selectedState.toUpperCase()] || ['212'];

  // Clean raw digits from starting phone input
  const cleanDigits = startingPhone.replace(/\D/g, '');
  const hasStartingPhone = cleanDigits.length === 10;
  const baseNumInt = hasStartingPhone ? parseInt(cleanDigits, 10) : 0;

  for (let i = 0; i < count; i++) {
    let rawPhone = '';

    // MODE 1: Sequential generation from a valid starting phone number
    if (hasStartingPhone) {
      const currentInt = baseNumInt + i;
      rawPhone = currentInt.toString().padStart(10, '0');
    } 
    // MODE 2: Blank / State-Based Lead Generation
    else {
      let areaCode = selectedAreaCode;

      // If "All Area Codes" is selected, randomly pick an area code from the target state
      if (areaCode === 'all' || !areaCode) {
        areaCode = stateAreaCodes[Math.floor(Math.random() * stateAreaCodes.length)];
      }

      const randomSuffix = generateRandomSubscriber();
      rawPhone = `${areaCode}${randomSuffix}`;
    }

    const formattedPhone = formatUsPhone(rawPhone);
    const phoneValid = validateNanpPhone(rawPhone);

    // Generate synthetic profile matching target state
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const streetAddress = faker.location.streetAddress();
    const city = faker.location.city();
    const zipCode = faker.location.zipCode({ state: selectedState });
    
    const addressValid = validateStateZip(zipCode, selectedState);

    profiles.push({
      rawPhone,
      formattedPhone,
      phoneValid,
      firstName,
      lastName,
      streetAddress,
      city,
      state: selectedState,
      zipCode,
      addressValid
    });
  }

  return profiles;
}
