// Geolocation and Google Maps utility functions

// Get current user location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location access denied by user'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out'));
            break;
          default:
            reject(new Error('An unknown error occurred while retrieving location'));
            break;
        }
      },
      options
    );
  });
};

// Watch user location changes
export const watchLocation = (callback, errorCallback) => {
  if (!navigator.geolocation) {
    errorCallback?.(new Error('Geolocation is not supported'));
    return null;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // 1 minute
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      errorCallback?.(error);
    },
    options
  );
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

// Get address from coordinates using reverse geocoding
export const reverseGeocode = async (latitude, longitude) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      // Extract address components
      const addressComponents = result.address_components;
      const address = {
        formatted: result.formatted_address,
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      };

      addressComponents.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number') || types.includes('route')) {
          address.street += component.long_name + ' ';
        }
        if (types.includes('locality')) {
          address.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          address.state = component.long_name;
        }
        if (types.includes('postal_code')) {
          address.zipCode = component.long_name;
        }
        if (types.includes('country')) {
          address.country = component.long_name;
        }
      });

      address.street = address.street.trim();
      return address;
    } else {
      throw new Error('No address found for these coordinates');
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Get coordinates from address using geocoding
export const geocodeAddress = async (address) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        address: data.results[0].formatted_address,
      };
    } else {
      throw new Error('No coordinates found for this address');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Check if location is within radius
export const isWithinRadius = (centerLat, centerLon, pointLat, pointLon, radiusKm) => {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radiusKm;
};

// Get user's saved location from localStorage
export const getSavedLocation = () => {
  try {
    const savedLocation = localStorage.getItem('userLocation');
    return savedLocation ? JSON.parse(savedLocation) : null;
  } catch (error) {
    console.error('Error getting saved location:', error);
    return null;
  }
};

// Save user's location to localStorage
export const saveLocation = (location) => {
  try {
    localStorage.setItem('userLocation', JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location:', error);
  }
};

// Clear saved location
export const clearSavedLocation = () => {
  try {
    localStorage.removeItem('userLocation');
  } catch (error) {
    console.error('Error clearing saved location:', error);
  }
};

// Check if geolocation permission is granted
export const checkGeolocationPermission = async () => {
  if (!navigator.permissions) {
    return 'unsupported';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.error('Error checking geolocation permission:', error);
    return 'unknown';
  }
};

// Request geolocation permission
export const requestGeolocationPermission = async () => {
  try {
    const location = await getCurrentLocation();
    return { granted: true, location };
  } catch (error) {
    return { granted: false, error: error.message };
  }
};

const locationService = {
  getCurrentLocation,
  watchLocation,
  calculateDistance,
  formatDistance,
  reverseGeocode,
  geocodeAddress,
  isWithinRadius,
  getSavedLocation,
  saveLocation,
  clearSavedLocation,
  checkGeolocationPermission,
  requestGeolocationPermission,
};

export default locationService;
