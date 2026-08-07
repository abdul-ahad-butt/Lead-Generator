import { useState, useMemo } from 'react';
import { US_STATE_AREA_CODES } from './usStateAreaCodes';

export interface UsePhoneStateSyncReturn {
  selectedState: string;
  selectedAreaCode: string;
  startingPhone: string;
  availableAreaCodes: string[];
  detectedAreaState: string | null;
  isValidFormat: boolean;
  handleStateChange: (stateCode: string) => void;
  handleAreaCodeChange: (areaCode: string) => void;
  handlePhoneInputChange: (input: string) => void;
  clearStartingPhone: () => void;
}

export function usePhoneStateSync(initialState: string = 'CO'): UsePhoneStateSyncReturn {
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [selectedAreaCode, setSelectedAreaCode] = useState<string>('all');
  const [subscriberDigits, setSubscriberDigits] = useState<string>('5550100'); // Default 7-digit suffix
  const [startingPhone, setStartingPhone] = useState<string>('(303) 555-0100');

  // Available area codes for the currently selected state
  const availableAreaCodes = useMemo(() => {
    return US_STATE_AREA_CODES[selectedState] || [];
  }, [selectedState]);

  // Reverse lookup: Map area code back to state code
  const detectedAreaState = useMemo(() => {
    const digits = startingPhone.replace(/\D/g, '');
    if (digits.length < 3) return null;
    const ac = digits.slice(0, 3);
    
    for (const [st, codes] of Object.entries(US_STATE_AREA_CODES)) {
      if (codes.includes(ac)) return st;
    }
    return null;
  }, [startingPhone]);

  // Basic validation check
  const isValidFormat = useMemo(() => {
    if (!startingPhone.trim()) return true; // Optional field is valid when empty
    const digits = startingPhone.replace(/\D/g, '');
    return digits.length === 10 && digits[0] !== '0' && digits[0] !== '1';
  }, [startingPhone]);

  // Format 10 digits as (XXX) XXX-XXXX
  const formatPhone = (areaCode: string, suffix: string): string => {
    const cleanSuffix = suffix.padEnd(7, '0').slice(0, 7);
    return `(${areaCode}) ${cleanSuffix.slice(0, 3)}-${cleanSuffix.slice(3)}`;
  };

  // 1. When Target State changes
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const newAvailable = US_STATE_AREA_CODES[newState] || [];

    // Reset area code selector to "All Area Codes (Random)"
    setSelectedAreaCode('all');

    // Automatically update phone to first area code of new state if phone is already filled
    if (startingPhone.trim() && newAvailable.length > 0) {
      const defaultAc = newAvailable[0];
      setStartingPhone(formatPhone(defaultAc, subscriberDigits));
    }
  };

  // 2. When Area Code Dropdown changes
  const handleAreaCodeChange = (newAreaCode: string) => {
    setSelectedAreaCode(newAreaCode);

    if (newAreaCode === 'all') {
      // Pick first area code as placeholder visual or leave as is
      if (availableAreaCodes.length > 0) {
        setStartingPhone(formatPhone(availableAreaCodes[0], subscriberDigits));
      }
    } else {
      // Swap out the first 3 digits with chosen area code
      setStartingPhone(formatPhone(newAreaCode, subscriberDigits));
    }
  };

  // 3. When Starting Phone input is typed manually
  const handlePhoneInputChange = (input: string) => {
    setStartingPhone(input);
    const digits = input.replace(/\D/g, '');

    if (digits.length >= 3) {
      const typedAreaCode = digits.slice(0, 3);
      if (availableAreaCodes.includes(typedAreaCode)) {
        setSelectedAreaCode(typedAreaCode);
      } else {
        setSelectedAreaCode('all');
      }
    }

    if (digits.length >= 10) {
      setSubscriberDigits(digits.slice(3, 10));
    }
  };

  const clearStartingPhone = () => {
    setStartingPhone('');
    setSelectedAreaCode('all');
  };

  return {
    selectedState,
    selectedAreaCode,
    startingPhone,
    availableAreaCodes,
    detectedAreaState,
    isValidFormat,
    handleStateChange,
    handleAreaCodeChange,
    handlePhoneInputChange,
    clearStartingPhone
  };
}
