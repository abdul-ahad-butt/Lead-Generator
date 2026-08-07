import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { fakerEN_US as faker } from '@faker-js/faker'
import { PhoneNumberUtil } from 'google-libphonenumber'
import { getRandomAreaCode, US_STATE_AREA_CODES } from './usStateAreaCodes'
import { validateNanpPhone, validateStateZip, STATE_ZIP_RANGES } from './usValidator'

const app = new Hono()

app.use('*', cors())

const phoneUtil = PhoneNumberUtil.getInstance()

const US_STATES: Record<string, string> = {
  'AK': 'Alaska', 'AL': 'Alabama', 'AR': 'Arkansas', 'AZ': 'Arizona', 'CA': 'California', 'CO': 'Colorado',
  'CT': 'Connecticut', 'DC': 'District of Columbia', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'IA': 'Iowa', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'KS': 'Kansas', 'KY': 'Kentucky',
  'LA': 'Louisiana', 'MA': 'Massachusetts', 'MD': 'Maryland', 'ME': 'Maine', 'MI': 'Michigan', 'MN': 'Minnesota',
  'MO': 'Missouri', 'MS': 'Mississippi', 'MT': 'Montana', 'NC': 'North Carolina', 'ND': 'North Dakota',
  'NE': 'Nebraska', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NV': 'Nevada',
  'NY': 'New York', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
  'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VA': 'Virginia',
  'VT': 'Vermont', 'WA': 'Washington', 'WI': 'Wisconsin', 'WV': 'West Virginia', 'WY': 'Wyoming'
}

const REVERSE_US_STATES = Object.fromEntries(
  Object.entries(US_STATES).map(([k, v]) => [v, k])
)

const AREA_CODES_BY_STATE: Record<string, string[]> = {
  "NJ": ["201", "551", "609", "640", "732", "848", "856", "862", "908", "973"], "DC": ["202", "771"],
  "CT": ["203", "475", "860", "959"], "AL": ["205", "251", "256", "334", "659", "938"], "ME": ["207"],
  "ID": ["208", "986"], "CA": ["209", "213", "279", "310", "323", "341", "350", "369", "408", "415", "424", "442", "510", "530", "559", "562", "619", "626", "628", "650", "657", "661", "669", "707", "714", "738", "747", "760", "805", "818", "820", "831", "840", "858", "909", "916", "925", "949", "951"],
  "TX": ["210", "214", "254", "281", "325", "346", "361", "409", "430", "432", "469", "512", "682", "713", "726", "737", "806", "817", "830", "832", "903", "915", "936", "940", "945", "956", "972", "979"],
  "NY": ["212", "315", "329", "332", "347", "363", "516", "518", "585", "607", "631", "646", "680", "716", "718", "838", "845", "914", "917", "929", "934"],
  "PA": ["215", "223", "267", "272", "412", "445", "484", "570", "582", "610", "717", "724", "814", "835", "878"],
  "OH": ["216", "220", "234", "283", "326", "330", "380", "419", "440", "513", "567", "614", "740", "937"],
  "IL": ["217", "224", "309", "312", "331", "447", "464", "618", "630", "708", "730", "773", "779", "815", "847", "872"],
  "MN": ["218", "320", "507", "612", "651", "763", "952"], "IN": ["219", "260", "317", "463", "574", "765", "812", "930"],
  "LA": ["225", "318", "337", "504", "985"], "MD": ["227", "240", "301", "410", "443", "667"], "MS": ["228", "601", "662", "769"],
  "GA": ["229", "404", "470", "478", "678", "706", "762", "770", "912", "943"], "MI": ["231", "248", "269", "313", "517", "586", "616", "734", "810", "906", "947", "989"],
  "MO": ["235", "314", "417", "557", "573", "636", "660", "816", "975"],
  "FL": ["239", "305", "321", "324", "352", "386", "407", "448", "561", "645", "656", "689", "727", "728", "754", "772", "786", "813", "850", "863", "904", "941", "954"],
  "NC": ["252", "336", "704", "743", "828", "910", "919", "980", "984"], "WI": ["262", "274", "353", "414", "534", "608", "715", "920"],
  "KY": ["270", "364", "502", "606", "859"], "VA": ["276", "434", "540", "571", "686", "703", "757", "804", "826", "948"],
  "DE": ["302"], "CO": ["303", "719", "720", "748", "970", "983"], "WV": ["304", "681"], "WY": ["307"],
  "NE": ["308", "402", "531"], "KS": ["316", "620", "785", "913"], "IA": ["319", "515", "563", "641", "712"],
  "AR": ["327", "479", "501", "870"], "MA": ["339", "351", "413", "508", "617", "774", "781", "857", "978"],
  "UT": ["385", "435"], "RI": ["401"], "OK": ["405", "539", "572", "580", "918"], "MT": ["406"],
  "TN": ["423", "615", "629", "731", "865", "901", "931"], "OR": ["458", "503", "541", "971"],
  "AZ": ["480", "520", "602", "623", "928"], "NM": ["505", "575"], "NH": ["603"], "SD": ["605"],
  "MP": ["670"], "GU": ["671"], "ND": ["701"], "NV": ["702", "725", "775"], "PR": ["787", "939"], "VT": ["802"],
  "SC": ["803", "821", "839", "843", "854", "864"], "HI": ["808"], "AK": ["907"],
  "WA": ["206", "253", "360", "425", "509", "564"]
}

const REVERSE_AREA_CODES: Record<string, string> = {}
for (const [state, acs] of Object.entries(AREA_CODES_BY_STATE)) {
  for (const ac of acs) {
    REVERSE_AREA_CODES[ac] = state
  }
}

function parsePhoneNumber(phoneStr: string): string {
  const digits = phoneStr.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.substring(1)
  }
  if (digits.length === 10) {
    return digits
  }
  return ""
}

function isValidUsNumber(phoneStr: string): boolean {
  try {
    const number = phoneUtil.parseAndKeepRawInput(phoneStr, 'US')
    return phoneUtil.isValidNumber(number)
  } catch (e) {
    return false
  }
}

function formatPhone(digits: string): string {
  return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`
}

app.post('/api/validate', async (c) => {
  const { phone } = await c.req.json()
  const parsedPhone = parsePhoneNumber(phone)
  
  if (!parsedPhone) {
    return c.json({ valid: false, error: "Must contain exactly 10 digits." }, 400)
  }

  const isValid = isValidUsNumber(`+1${parsedPhone}`)
  const areaCode = parsedPhone.substring(0, 3)
  const stateAbbr = REVERSE_AREA_CODES[areaCode]
  const stateName = stateAbbr ? US_STATES[stateAbbr] : null

  return c.json({
    parsedPhone,
    isValid,
    stateAbbr,
    stateName
  })
})

app.post('/api/generate', async (c) => {
  const { startPhone, count, stateFilter, columns } = await c.req.json()
  
  let baseInt: bigint | null = null
  const isMode1 = !!startPhone
  
  if (isMode1) {
    const parsedPhone = parsePhoneNumber(startPhone)
    if (!parsedPhone) {
      return c.json({ error: "Invalid start phone" }, 400)
    }
    baseInt = BigInt(parsedPhone)
  } else {
    // Mode 2: Blank start phone requires a specific state
    if (!stateFilter || stateFilter === 'Auto-Detect from Phone' || stateFilter === 'ALL' || stateFilter === 'ALL (Random States)') {
      return c.json({ error: "A specific target state must be selected when starting phone is blank." }, 400)
    }
  }

  const records = []
  const stats = {
    totalRecords: count,
    validNumbers: 0,
    validAddresses: 0
  }
  
  // Set faker seed for consistent randomness if needed, or leave unseeded
  faker.seed() 
  
  for (let i = 0; i < count; i++) {
    let rawPhone = ""
    let stateAbbr = ""

    if (isMode1 && baseInt !== null) {
      const currentPhoneInt = baseInt + BigInt(i)
      rawPhone = currentPhoneInt.toString().padStart(10, '0')
      stateAbbr = faker.location.state({ abbreviated: true })
      if (stateFilter && stateFilter.toUpperCase() !== "ALL" && stateFilter !== 'ALL (Random States)') {
        stateAbbr = stateFilter.toUpperCase()
      }
    } else {
      // Mode 2 logic
      stateAbbr = stateFilter.toUpperCase()
      const areaCode = getRandomAreaCode(stateAbbr) || "212"
      const nxx = Math.floor(Math.random() * 800) + 200 // 200-999
      const xxxx = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      rawPhone = `${areaCode}${nxx}${xxxx}`
    }

    const formattedPhone = formatPhone(rawPhone)
    const phoneValid = validateNanpPhone(rawPhone)
    
    // Ensure zip is tied to the state
    let zipCode = faker.location.zipCode({ state: stateAbbr })
    const ranges = STATE_ZIP_RANGES[stateAbbr]
    if (ranges && ranges.length > 0) {
      // Pick a random range for the state and generate a random prefix
      const range = ranges[Math.floor(Math.random() * ranges.length)]
      const prefix = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]
      const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0')
      zipCode = `${prefix}${suffix}`
    }
    
    const addressValid = validateStateZip(zipCode, stateAbbr)

    if (phoneValid) stats.validNumbers++
    if (addressValid) stats.validAddresses++
    
    const record: any = {
      "Phone Number (Raw)": rawPhone,
      "Phone Number (Formatted)": formattedPhone,
      "Format Valid": phoneValid ? "✅" : "❌",
      "First Name": faker.person.firstName(),
      "Last Name": faker.person.lastName(),
      "Street Address": faker.location.streetAddress(),
      "City": faker.location.city(),
      "State": stateAbbr,
      "ZIP Code": zipCode
    }
    
    const filteredRecord: any = {}
    for (const col of columns) {
      if (record[col] !== undefined) {
        filteredRecord[col] = record[col]
      }
    }
    
    records.push(filteredRecord)
  }
  
  return c.json({ records, stats })
})

app.get('/api/metadata', (c) => {
  return c.json({
    states: US_STATES,
    areaCodes: AREA_CODES_BY_STATE
  })
})

export default app
