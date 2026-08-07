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
export async function generateProfiles({
  selectedState,
  selectedAreaCode,
  startingPhone = '',
  count = 100
}: GeneratorParams): Promise<ProfileRecord[]> {
  const backendUrl = 'https://backend.jerrystankas087.workers.dev';
  
  // Define the columns expected by the backend to get all data
  const requestColumns = [
    "Phone Number (Raw)",
    "Phone Number (Formatted)",
    "Format Valid",
    "First Name",
    "Last Name",
    "Street Address",
    "City",
    "State",
    "ZIP Code"
  ];

  try {
    const response = await fetch(`${backendUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startPhone: startingPhone,
        count: count,
        stateFilter: selectedState,
        columns: requestColumns
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map backend response format back to frontend ProfileRecord format
    return data.records.map((record: any) => ({
      rawPhone: record["Phone Number (Raw)"] || "",
      formattedPhone: record["Phone Number (Formatted)"] || "",
      phoneValid: record["Format Valid"] === "✅",
      firstName: record["First Name"] || "",
      lastName: record["Last Name"] || "",
      streetAddress: record["Street Address"] || "",
      city: record["City"] || "",
      state: record["State"] || selectedState,
      zipCode: record["ZIP Code"] || "",
      addressValid: true // Assuming valid if returned from backend
    }));
  } catch (error) {
    console.error("Failed to generate profiles from backend:", error);
    return [];
  }
}
