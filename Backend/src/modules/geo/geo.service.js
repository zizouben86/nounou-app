const axios = require('axios');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const HEADERS = {
  'User-Agent': 'NounouHome/1.0 (contact@nounouhome.cm)',
};

// Valeurs a ignorer (placeholders)
const INVALID_VALUES = ['a completer', 'à compléter', 'completer', '00000', ''];

const isValidValue = (value) => {
  if (!value) return false;
  const lower = value.toString().toLowerCase().trim();
  return !INVALID_VALUES.includes(lower) && lower.length > 2;
};

const geocodeAddress = async (address, city, postalCode) => {
  try {
    // Filtrer les valeurs invalides
    const parts = [];
    if (isValidValue(address)) parts.push(address);
    if (isValidValue(city)) parts.push(city);
    if (isValidValue(postalCode)) parts.push(postalCode);
    parts.push('Cameroun');

    const query = parts.join(', ');

    if (parts.length <= 1) {
      console.warn('⚠️ Pas assez d infos pour geocoder');
      return null;
    }

    console.log('🌍 Geocoding : ' + query);

    const { data } = await axios.get(NOMINATIM_URL, {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        countrycodes: 'cm',
      },
      headers: HEADERS,
      timeout: 10000,
    });

    if (!data || data.length === 0) {
      console.warn('⚠️ Adresse non trouvee : ' + query);
      return null;
    }

    console.log('✅ Coordonnees trouvees : ' + data[0].lat + ', ' + data[0].lon);

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (err) {
    console.error('❌ Erreur geocoding : ' + err.message);
    return null;
  }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
};

const filterByRadius = (nannies, userLat, userLng, maxKm) => {
  return nannies
    .map((nanny) => {
      if (!nanny.latitude || !nanny.longitude) {
        return { ...nanny, distance: null };
      }
      const distance = calculateDistance(userLat, userLng, nanny.latitude, nanny.longitude);
      return { ...nanny, distance };
    })
    .filter((nanny) => nanny.distance === null || nanny.distance <= maxKm)
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
};

module.exports = { geocodeAddress, calculateDistance, filterByRadius };