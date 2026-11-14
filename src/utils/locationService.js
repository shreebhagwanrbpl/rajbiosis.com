// Intelligent Location Detection & Reverse Geocoding Service
// Supports Browser Geolocation, Reverse Geocode APIs, Nearest Coordinates Fallback, and IP Geolocation

import { saveActiveDistrict } from './userProfile';

// District Coordinates for high-precision local matching across Rajasthan and India
export const DISTRICT_COORDINATES = [
  // Shekhawati Zone
  { name: 'Churu', lat: 28.2900, lon: 74.9600, state: 'Rajasthan' },
  { name: 'Sikar', lat: 27.6094, lon: 75.1398, state: 'Rajasthan' },
  { name: 'Jhunjhunu', lat: 28.1289, lon: 75.3995, state: 'Rajasthan' },

  // Jaipur Capital Region & Central
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  { name: 'Dausa', lat: 26.8924, lon: 76.3377, state: 'Rajasthan' },
  { name: 'Tonk', lat: 26.1664, lon: 75.7885, state: 'Rajasthan' },
  { name: 'Ajmer', lat: 26.4499, lon: 74.6399, state: 'Rajasthan' },
  { name: 'Nagaur', lat: 27.2070, lon: 73.7423, state: 'Rajasthan' },

  // Western & Marwar Zone
  { name: 'Jodhpur', lat: 26.2389, lon: 73.0243, state: 'Rajasthan' },
  { name: 'Pali', lat: 25.7713, lon: 73.3237, state: 'Rajasthan' },
  { name: 'Barmer', lat: 25.7521, lon: 71.3967, state: 'Rajasthan' },
  { name: 'Jaisalmer', lat: 26.9157, lon: 70.9083, state: 'Rajasthan' },
  { name: 'Jalore', lat: 25.3458, lon: 72.6155, state: 'Rajasthan' },
  { name: 'Sirohi', lat: 24.8826, lon: 72.8584, state: 'Rajasthan' },

  // Northern Zone
  { name: 'Bikaner', lat: 28.0229, lon: 73.3119, state: 'Rajasthan' },
  { name: 'Sri Ganganagar', lat: 29.9038, lon: 73.8772, state: 'Rajasthan' },
  { name: 'Hanumangarh', lat: 29.5810, lon: 74.3294, state: 'Rajasthan' },
  { name: 'Anupgarh', lat: 29.1914, lon: 73.2089, state: 'Rajasthan' },

  // Hadoti & South Eastern Zone
  { name: 'Kota', lat: 25.2138, lon: 75.8648, state: 'Rajasthan' },
  { name: 'Bundi', lat: 25.4414, lon: 75.6428, state: 'Rajasthan' },
  { name: 'Baran', lat: 25.1011, lon: 76.5132, state: 'Rajasthan' },
  { name: 'Jhalawar', lat: 24.5973, lon: 76.1610, state: 'Rajasthan' },
  { name: 'Sawai Madhopur', lat: 25.9928, lon: 76.3533, state: 'Rajasthan' },

  // Mewar & Southern Zone
  { name: 'Udaipur', lat: 24.5854, lon: 73.7125, state: 'Rajasthan' },
  { name: 'Chittorgarh', lat: 24.8887, lon: 74.6269, state: 'Rajasthan' },
  { name: 'Bhilwara', lat: 25.3407, lon: 74.6313, state: 'Rajasthan' },
  { name: 'Rajsamand', lat: 25.0746, lon: 73.8825, state: 'Rajasthan' },
  { name: 'Banswara', lat: 23.5461, lon: 74.4349, state: 'Rajasthan' },
  { name: 'Dungarpur', lat: 23.8368, lon: 73.7139, state: 'Rajasthan' },
  { name: 'Pratapgarh', lat: 24.0319, lon: 74.7813, state: 'Rajasthan' },

  // Eastern & Matsya Zone
  { name: 'Alwar', lat: 27.5530, lon: 76.6346, state: 'Rajasthan' },
  { name: 'Bharatpur', lat: 27.2152, lon: 77.5030, state: 'Rajasthan' },
  { name: 'Dholpur', lat: 26.7025, lon: 77.8934, state: 'Rajasthan' },
  { name: 'Karauli', lat: 26.4950, lon: 77.0200, state: 'Rajasthan' },
  { name: 'Kotputli-Behror', lat: 27.7022, lon: 76.2023, state: 'Rajasthan' },

  // Major NCR & Metros
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi NCR' },
  { name: 'Gurugram', lat: 28.4595, lon: 77.0266, state: 'Haryana' },
  { name: 'Noida', lat: 28.5355, lon: 77.3910, state: 'Uttar Pradesh' },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra' }
];

/**
 * Calculate Great Circle Distance (Haversine formula in KM)
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the closest district from latitude & longitude
 */
export function findNearestDistrict(lat, lon) {
  if (!lat || !lon) return 'Jaipur';
  let closestDistrict = 'Jaipur';
  let minDistance = Infinity;

  for (const item of DISTRICT_COORDINATES) {
    const dist = getDistanceFromLatLonInKm(lat, lon, item.lat, item.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closestDistrict = item.name;
    }
  }

  return closestDistrict;
}

/**
 * Reverse geocode latitude & longitude to a human-readable city/district
 */
export async function reverseGeocode(lat, lon) {
  // 1. First try free BigDataCloud client API (fast & CORS-friendly)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const detectedCity = data.city || data.locality || data.principalSubdivisionDistrict;
      if (detectedCity) {
        // Check if detected city name matches one of our known districts
        const norm = detectedCity.trim().toLowerCase();
        const match = DISTRICT_COORDINATES.find(
          (d) => d.name.toLowerCase() === norm || norm.includes(d.name.toLowerCase())
        );
        if (match) return match.name;
        return detectedCity.trim();
      }
    }
  } catch (err) {
    // Continue to distance fallback
  }

  // 2. Second try OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const address = data.address || {};
      const place =
        address.city ||
        address.town ||
        address.county ||
        address.state_district ||
        address.district;

      if (place) {
        const norm = place.replace(/district/gi, '').trim().toLowerCase();
        const match = DISTRICT_COORDINATES.find(
          (d) => d.name.toLowerCase() === norm || norm.includes(d.name.toLowerCase())
        );
        if (match) return match.name;
        return place.replace(/district/gi, '').trim();
      }
    }
  } catch (err) {
    // Continue to nearest distance fallback
  }

  // 3. Fallback: mathematical nearest coordinates matching
  return findNearestDistrict(lat, lon);
}

/**
 * Fallback to IP geolocation if browser GPS is denied or unavailable
 */
export async function detectLocationFromIP() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.city) {
        const norm = data.city.trim().toLowerCase();
        const match = DISTRICT_COORDINATES.find(
          (d) => d.name.toLowerCase() === norm || norm.includes(d.name.toLowerCase())
        );
        if (match) return match.name;
        return data.city;
      }
      if (data && data.latitude && data.longitude) {
        return findNearestDistrict(data.latitude, data.longitude);
      }
    }
  } catch (err) {
    // IP detection error
  }
  return null;
}

/**
 * Request user's current GPS location and automatically apply it
 */
export function requestBrowserLocation() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve({ success: false, error: 'Geolocation not supported by browser' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const district = await reverseGeocode(latitude, longitude);
          applyUserDistrict(district, { lat: latitude, lon: longitude, method: 'gps' });
          resolve({ success: true, district, method: 'gps', coords: { latitude, longitude } });
        } catch (err) {
          const nearest = findNearestDistrict(latitude, longitude);
          applyUserDistrict(nearest, { lat: latitude, lon: longitude, method: 'gps-nearest' });
          resolve({ success: true, district: nearest, method: 'gps-nearest' });
        }
      },
      async (err) => {
        // Geolocation denied or unavailable -> try IP fallback
        const ipDistrict = await detectLocationFromIP();
        if (ipDistrict) {
          applyUserDistrict(ipDistrict, { method: 'ip' });
          resolve({ success: true, district: ipDistrict, method: 'ip' });
        } else {
          resolve({ success: false, error: err.message, code: err.code });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}

/**
 * Save district, update localStorage, and notify all components across the site
 */
export function applyUserDistrict(districtName, meta = {}) {
  if (typeof window === 'undefined' || !districtName) return;
  const cleanDistrict = districtName.trim();

  try {
    saveActiveDistrict(cleanDistrict);
    localStorage.setItem(
      'rajbiosis_location_meta',
      JSON.stringify({
        district: cleanDistrict,
        timestamp: new Date().toISOString(),
        ...meta
      })
    );
    localStorage.setItem('rajbiosis_location_allowed', 'true');

    // Notify listeners
    window.dispatchEvent(
      new CustomEvent('active-district-changed', {
        detail: cleanDistrict
      })
    );
    window.dispatchEvent(
      new CustomEvent('rajbiosis-location-updated', {
        detail: { district: cleanDistrict, ...meta }
      })
    );
  } catch (err) {
    console.error('Error applying user district:', err);
  }
}

