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
  sla: 'Same-Day Hospital Dispatch & 4-Hour Emergency Response across Jaipur',
  facilities: [
    'Central Biomedical Calibration Laboratory',
    'Main ISO 13485 Equipment Assembly Depot',
    'Statewide Spare Parts Repository',
    'GeM Tender & Institutional Procurement Cell'
  ]
};

export const REGIONAL_BRANCHES = [
  {
    id: 'churu-branch',
    city: 'Churu',
    state: 'Rajasthan',
    type: 'Regional Depot & Biomedical Service Station',
    pincode: '331001',
    address: 'Shop No. 12-14, Medical Market, Near D.B. General Hospital, Station Road, Churu - 331001, Rajasthan',
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
    address: 'Plot No. 42-B, Heavy Industrial Area, Phase II, Near AIIMS Road, Jodhpur - 342005, Rajasthan',
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
    address: 'Medical Commercial Complex, Opposite New Medical College Hospital, Jhalawar Road, Kota - 324005, Rajasthan',
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
    address: 'Ground Floor, Opp. PBM Hospital Emergency Gate, Sadul Colony, Bikaner - 334001, Rajasthan',
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
    address: 'Shop 8-10, Medical Enclave, Near RNT Medical College, Chetak Circle, Udaipur - 313001, Rajasthan',
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
    type: 'Shekhawati Regional Service Station',
    pincode: '332001',
    address: 'Commercial Wing, Near S.K. Hospital, Station Road, Sikar - 332001, Rajasthan',
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
    address: 'Near JLN Medical College & Hospital, Civil Lines, Ajmer - 305001, Rajasthan',
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
    address: 'Plot 18, Near Rajiv Gandhi General Hospital, M.I.A. Road, Alwar - 301001, Rajasthan',
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
    address: 'Near District Civil Hospital, Sukhadia Circle, Sri Ganganagar - 335001, Rajasthan',
    phone: '+91 99833 33469',
    email: 'ganganagar.hub@rajbiosis.com',
    leadEngineer: 'Er. Harpreet Singh',
    hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    sla: '24-48 Hours Regional Hospital Dispatch & Field Engineering',
    coverage: ['Sri Ganganagar', 'Hanumangarh', 'Suratgarh', 'Anupgarh']
  }
];

/**
 * Get office information based on the user's active district.
 * If user is in Jaipur:
 *   - Only Head Office is shown (since Jaipur IS the corporate HQ & central depot).
 * If user is in another city (e.g. Churu, Jodhpur, etc.):
 *   - Shows the user's Local Regional Hub / Service Office (with local address, phone, SLA)
 *   - PLUS the Corporate Headquarters in Jaipur!
 */
export function getOfficeForDistrict(districtName = 'Jaipur') {
  const normalized = (districtName || 'Jaipur').trim();
  const lower = normalized.toLowerCase();

  // If in Jaipur: Head office is the primary office
  if (lower === 'jaipur' || lower === 'jaipur rural') {
    return {
      isHeadOfficeOnly: true,
      currentOffice: HEAD_OFFICE,
      local: null,
      head: HEAD_OFFICE
    };
  }

  // Check if we have an explicit predefined regional branch
  const found = REGIONAL_BRANCHES.find(
    (b) => b.city.toLowerCase() === lower || b.coverage.some((c) => c.toLowerCase().includes(lower))
  );

  if (found) {
    return {
      isHeadOfficeOnly: false,
      currentOffice: found,
      local: found,
      head: HEAD_OFFICE
    };
  }

  // Dynamic Regional Branch for any other district in Rajasthan / India
  const dynamicBranch = {
    id: `${lower.replace(/[^a-z0-9]/g, '-')}-hub`,
    city: normalized,
    state: 'Rajasthan',
    type: `${normalized} Regional Service Hub & Depot`,
    pincode: '302001',
    address: `District Medical Hub, Near District General Hospital, ${normalized}, Rajasthan`,
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
    head: HEAD_OFFICE
  };
}
