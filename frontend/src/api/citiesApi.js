// API for fetching cities with live statistics from backend
const API_BASE_URL = 'http://localhost:8080/api';

export const fetchCitiesWithStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cities/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities statistics');
    }
    const data = await response.json();
    console.log('[Cities API] Fetched cities with live stats:', data);
    return data;
  } catch (error) {
    console.error('[Cities API] Error fetching cities:', error);
    // Return empty array on error
    return [];
  }
};
