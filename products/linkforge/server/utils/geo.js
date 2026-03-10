// server/utils/geo.js - Geolocation utilities

/**
 * Get geolocation data from IP address
 * Uses ip-api.com free tier (no API key required, 45 req/min)
 * For production, consider ipinfo.io, ipgeolocation.io, or MaxMind GeoIP2
 * 
 * @param {string} ipAddress - IP address to lookup
 * @returns {Promise<Object|null>} Geo data { country, city } or null
 */
async function getGeoFromIP(ipAddress) {
  // Skip local/private IPs
  if (!ipAddress || 
      ipAddress === '::1' || 
      ipAddress === '127.0.0.1' ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.16.')) {
    return null;
  }

  try {
    // Use ip-api.com free service
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city`, {
      timeout: 3000 // 3 second timeout
    });

    if (!response.ok) {
      console.warn(`Geo lookup failed for ${ipAddress}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status !== 'success') {
      return null;
    }

    return {
      country: data.country || null,
      city: data.city || null
    };
  } catch (error) {
    console.warn(`Geo lookup error for ${ipAddress}:`, error.message);
    return null;
  }
}

/**
 * Alternative: Get geo from CloudFlare headers (if behind CF)
 * CloudFlare adds geolocation headers automatically
 * 
 * @param {Object} headers - Express request headers
 * @returns {Object|null} Geo data { country, city } or null
 */
function getGeoFromCloudflare(headers) {
  const country = headers['cf-ipcountry'];
  const city = headers['cf-ipcity'];

  if (!country || country === 'XX') {
    return null;
  }

  return {
    country: country || null,
    city: city || null
  };
}

module.exports = {
  getGeoFromIP,
  getGeoFromCloudflare
};
