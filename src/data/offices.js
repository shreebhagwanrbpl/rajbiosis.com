// Official Raj Biosis Pvt. Ltd. Office Network Database
// Corporate Headquarters (Jaipur) + Regional Service Depots across Rajasthan & India

export const HEAD_OFFICE = {
  id: 'jaipur-hq',
  city: 'Jaipur',
  state: 'Rajasthan',
  type: 'Corporate Headquarters & Central Depot',
  pincode: '302021',
  address: '1st Floor, F-4, Plot No. 16, D-Block, Tagore Nagar, Nr. 200 Feet Bypass, Jaipur - 302021, Rajasthan, India',
  phone: '9983333469',
  tollFree: '1800-202-6040 (24x7)',
  email: 'info@rajbiosis.com',
  secondaryEmail: 'jaipur.hq@rajbiosis.com',
  hours: 'Mon - Sat: 9:00 AM - 8:00 PM IST (24x7 Emergency ICU Support)',
  facilities: [
    'Central Biomedical Calibration Laboratory',
    'Main ISO 13485 Equipment Assembly Depot',
    'Statewide Spare Parts Repository',
    'GeM Tender & Institutional Procurement Cell'
  ]
};

/**
 * Central City Location Generator for all districts & cities.
 * Displays the authentic Main City Center / Regional Hub instead of localized market names.
 */
export function getCityCentralLocation(cityName, state = 'Rajasthan') {
  if (!cityName) return 'Jaipur Main City Center, Rajasthan, India';
  const clean = cityName.trim();
  return `${clean} Main City Center, ${state}, India`;
}

export function getCityCentralMapUrl(cityName = 'Jaipur', state = 'Rajasthan') {
  const clean = (cityName || 'Jaipur').trim();
  const query = `${clean} city center, ${state}, India`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Main City Center address mapping for all regional branches & districts.
 */
export const POPULAR_CITY_LOCATIONS = new Proxy({}, {
  get: (target, prop) => {
    if (typeof prop === 'string') {
      const cityCapitalized = prop.charAt(0).toUpperCase() + prop.slice(1);
      return `${cityCapitalized} Main City Center, Rajasthan, India`;
    }
    return 'Main City Center, Rajasthan, India';
  }
});

export function getPopularLocationForCity(cityName, state = 'Rajasthan') {
  return getCityCentralLocation(cityName, state);
}

export const REGIONAL_BRANCHES = [
  {
    id: 'churu-branch',
    city: 'Churu',
    state: 'Rajasthan',
    type: 'Regional Depot & Biomedical Service Station',
    pincode: '331001',
    address: POPULAR_CITY_LOCATIONS['churu'],
    phone: '+91 99833 33469 / 01562-250144',
    email: 'churu.desk@rajbiosis.com',
    leadEngineer: 'Er. Rakesh Choudhary (Senior Biomedical Lead - Shekhawati Zone)',
    hours: 'Mon - Sat: 9:30 AM - 7:30 PM (On-Call 24x7 ICU Support)',
    sla: '24-Hour Express Hospital Delivery & Dedicated On-Site Biomedical Engineer in Churu',
    coverage: ['Churu City', 'Ratangarh', 'Sujangarh', 'Sardarshahar', 'Rajgarh (Sadulpur)', 'Bidasar', 'Taranagar']
  },
  {
    id: 'jodhpur-branch',
    city: 'Jodhpur',
    state: 'Rajasthan',
    type: 'Western Regional Distribution Hub',
    pincode: '342005',
    address: POPULAR_CITY_LOCATIONS['jodhpur'],
    phone: '+91 99833 33469',
    email: 'jodhpur.hub@rajbiosis.com',
    leadEngineer: 'Er. Vikram Bhati',
    hours: 'Mon - Sat: 9:00 AM - 8:00 PM',
    sla: 'Same-Day Marwar Express Dispatch & Rapid OT Calibration SLA',
    coverage: ['Jodhpur', 'Pali', 'Barmer', 'Jaisalmer', 'Nagaur']
  },
  {
    id: 'kota-branch',
    city: 'Kota',
    state: 'Rajasthan',
    type: 'Hadoti Regional Hub & Service Center',
    pincode: '324005',
    address: POPULAR_CITY_LOCATIONS['kota'],
    phone: '+91 99833 33469',
    email: 'kota.hub@rajbiosis.com',
    leadEngineer: 'Er. Suresh Meena',
    hours: 'Mon - Sat: 9:00 AM - 8:00 PM',
    sla: 'Next-Day Hospital Delivery & 6-Hour Emergency AMC SLA in Hadoti Zone',
    coverage: ['Kota', 'Baran', 'Bundi', 'Jhalawar']
  },
  {
    id: 'bikaner-branch',
    city: 'Bikaner',
    state: 'Rajasthan',
    type: 'North Regional Depot & Biomedical Station',
    pincode: '334001',
    address: POPULAR_CITY_LOCATIONS['bikaner'],
    phone: '+91 99833 33469',
    email: 'bikaner.hub@rajbiosis.com',
    leadEngineer: 'Er. Amit Bishnoi',
    hours: 'Mon - Sat: 9:00 AM - 7:30 PM',
    sla: '24-Hour Express Delivery & Northern Zone Biomedical Service',
    coverage: ['Bikaner', 'Nokha', 'Lunkaransar', 'Dungargarh']
  },
  {
    id: 'udaipur-branch',
    city: 'Udaipur',
    state: 'Rajasthan',
    type: 'Mewar Regional Service Center',
    pincode: '313001',
    address: POPULAR_CITY_LOCATIONS['udaipur'],
    phone: '+91 99833 33469',
    email: 'udaipur.hub@rajbiosis.com',
    leadEngineer: 'Er. Kailash Sharma',
    hours: 'Mon - Sat: 9:00 AM - 7:30 PM',
    sla: 'Southern Rajasthan Express Depot Stock & On-Site Installation',
    coverage: ['Udaipur', 'Rajsamand', 'Chittorgarh', 'Dungarpur', 'Banswara']
  },
  {
    id: 'sikar-branch',
    city: 'Sikar',
    state: 'Rajasthan',
    type: 'Shekhawati Regional Office Address',
    pincode: '332001',
    address: POPULAR_CITY_LOCATIONS['sikar'],
    phone: '+91 99833 33469',
    email: 'sikar.hub@rajbiosis.com',
    leadEngineer: 'Er. Manoj Verma',
    hours: 'Mon - Sat: 9:30 AM - 7:30 PM',
    sla: 'Next-Day Shekhawati Medical Supply & Calibration SLA',
    coverage: ['Sikar', 'Fatehpur', 'Laxmangarh', 'Neem Ka Thana', 'Jhunjhunu']
  },
  {
    id: 'ajmer-branch',
    city: 'Ajmer',
    state: 'Rajasthan',
    type: 'Central Rajasthan Regional Depot',
    pincode: '305001',
    address: POPULAR_CITY_LOCATIONS['ajmer'],
    phone: '+91 99833 33469',
    email: 'ajmer.hub@rajbiosis.com',
    leadEngineer: 'Er. Pradeep Rawat',
    hours: 'Mon - Sat: 9:00 AM - 8:00 PM',
    sla: 'Same-Day Central Rajasthan Medical Dispatch & Calibration',
    coverage: ['Ajmer', 'Kishangarh', 'Beawar', 'Bhilwara', 'Tonk']
  },
  {
    id: 'alwar-branch',
    city: 'Alwar',
    state: 'Rajasthan',
    type: 'Alwar & NCR Corridor Depot',
    pincode: '301001',
    address: POPULAR_CITY_LOCATIONS['alwar'],
    phone: '+91 99833 33469',
    email: 'alwar.hub@rajbiosis.com',
    leadEngineer: 'Er. Deepak Yadav',
    hours: 'Mon - Sat: 9:00 AM - 7:30 PM',
    sla: 'Next-Day Delivery & Rapid Technical Engineer Visit',
    coverage: ['Alwar', 'Bhiwadi', 'Tijara', 'Kotputli', 'Bharatpur']
  },
  {
    id: 'ganganagar-branch',
    city: 'Sri Ganganagar',
    state: 'Rajasthan',
    type: 'Northern Frontier Regional Depot',
    pincode: '335001',
    address: POPULAR_CITY_LOCATIONS['sri ganganagar'],
    phone: '+91 99833 33469',
    email: 'ganganagar.hub@rajbiosis.com',
    leadEngineer: 'Er. Harpreet Singh',
    hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    sla: '24-48 Hours Regional Hospital Dispatch & Field Engineering',
    coverage: ['Sri Ganganagar', 'Hanumangarh', 'Suratgarh', 'Anupgarh']
  },
  {
    id: 'bhilwara-branch',
    city: 'Bhilwara',
    state: 'Rajasthan',
    type: 'Textile City Regional Service Hub',
    pincode: '311001',
    address: POPULAR_CITY_LOCATIONS['bhilwara'],
    phone: '+91 99833 33469',
    email: 'bhilwara.hub@rajbiosis.com',
    leadEngineer: 'Er. Rakesh Tailor',
    hours: 'Mon - Sat: 9:00 AM - 7:30 PM',
    sla: 'Next-Day Hospital Delivery & Biomedical Support',
    coverage: ['Bhilwara', 'Shahpura', 'Mandalgarh', 'Gulabpura', 'Asind']
  },
  {
    id: 'pali-branch',
    city: 'Pali',
    state: 'Rajasthan',
    type: 'Marwar Industrial Regional Depot',
    pincode: '306401',
    address: POPULAR_CITY_LOCATIONS['pali'],
    phone: '+91 99833 33469',
    email: 'pali.hub@rajbiosis.com',
    leadEngineer: 'Er. Mahendra Sen',
    hours: 'Mon - Sat: 9:00 AM - 7:30 PM',
    sla: 'Same-Day Marwar Express Dispatch & Support',
    coverage: ['Pali', 'Sumerpur', 'Falna', 'Sojat', 'Jaitaran']
  },
  {
    id: 'barmer-branch',
    city: 'Barmer',
    state: 'Rajasthan',
    type: 'Thar Western Regional Service Hub',
    pincode: '344001',
    address: POPULAR_CITY_LOCATIONS['barmer'],
    phone: '+91 99833 33469',
    email: 'barmer.hub@rajbiosis.com',
    leadEngineer: 'Er. Dinesh Rathore',
    hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    sla: '24-48 Hours Direct Field Engineer Deployment',
    coverage: ['Barmer', 'Balotra', 'Baytu', 'Siwana', 'Gudamalani']
  },
  {
    id: 'bharatpur-branch',
    city: 'Bharatpur',
    state: 'Rajasthan',
    type: 'Braj Regional Service Station',
    pincode: '321001',
    address: POPULAR_CITY_LOCATIONS['bharatpur'],
    phone: '+91 99833 33469',
    email: 'bharatpur.hub@rajbiosis.com',
    leadEngineer: 'Er. Nitin Sharma',
    hours: 'Mon - Sat: 9:00 AM - 7:30 PM',
    sla: 'Next-Day Regional Hospital Supply & Service',
    coverage: ['Bharatpur', 'Bayana', 'Deeg', 'Kumher', 'Nadbai']
  }
];

/**
 * Get office information based on the user's active district.
 * If user is in Jaipur:
 *   - Only Head Office is shown (since Jaipur IS the corporate HQ & central depot).
 * If user is in another city (e.g. Churu, Jodhpur, etc.):
 *   - Shows the user's Local Regional Hub / Service Office with its Main City Center address!
 *   - PLUS the central city map view and Corporate Headquarters in Jaipur!
 */
export function getOfficeForDistrict(districtName = 'Jaipur', state = 'Rajasthan') {
  const normalized = (districtName || 'Jaipur').trim();
  const lower = normalized.toLowerCase();
  const headMap = getCityCentralMapUrl('Tagore Nagar, Jaipur', 'Rajasthan');

  const headWithMap = {
    ...HEAD_OFFICE,
    mapEmbedUrl: headMap,
    mapQuery: 'Tagore Nagar, Jaipur, Rajasthan, India'
  };

  // If in Jaipur: Head office is the primary office
  if (lower === 'jaipur' || lower === 'jaipur rural') {
    return {
      isHeadOfficeOnly: true,
      currentOffice: headWithMap,
      local: null,
      head: headWithMap,
      mapEmbedUrl: headMap
    };
  }

  const centralAddress = getCityCentralLocation(normalized, state);
  const cityMapUrl = getCityCentralMapUrl(normalized, state);

  // 1. Check if we have an exact city match first
  let found = REGIONAL_BRANCHES.find((b) => b.city.toLowerCase() === lower);

  // 2. If no direct city branch in predefined array, check if city has coverage
  if (!found) {
    found = REGIONAL_BRANCHES.find((b) => b.coverage.some((c) => c.toLowerCase().includes(lower)));
  }

  if (found) {
    const personalizedFound = {
      ...found,
      city: normalized,
      address: centralAddress,
      mapEmbedUrl: cityMapUrl,
      mapQuery: `${normalized} city center, ${state}, India`
    };

    return {
      isHeadOfficeOnly: false,
      currentOffice: personalizedFound,
      local: personalizedFound,
      head: headWithMap,
      mapEmbedUrl: cityMapUrl
    };
  }

  // Dynamic Regional Branch for any other district in Rajasthan / India
  const dynamicBranch = {
    id: `${lower.replace(/[^a-z0-9]/g, '-')}-hub`,
    city: normalized,
    state: state,
    type: `${normalized} Main City Regional Depot & Service Station`,
    pincode: '302001',
    address: centralAddress,
    mapEmbedUrl: cityMapUrl,
    mapQuery: `${normalized} city center, ${state}, India`,
    phone: '+91 99833 33469',
    email: `${lower.replace(/[^a-z0-9]/g, '')}.desk@rajbiosis.com`,
    leadEngineer: `Er. Biomedical Lead (${normalized} Zone)`,
    hours: 'Mon - Sat: 9:30 AM - 7:00 PM (Emergency 24x7 ICU Support)',
    sla: `24-48 Hours Express Dispatch from Jaipur Central Depot to ${normalized} & Dedicated Field Biomedical Engineer`,
    coverage: [normalized, `Surrounding ${normalized} Healthcare Facilities`]
  };

  return {
    isHeadOfficeOnly: false,
    currentOffice: dynamicBranch,
    local: dynamicBranch,
    head: headWithMap,
    mapEmbedUrl: cityMapUrl
  };
}
