import axios from "axios";

const API_URL = "http://localhost:8080/api/station";

// POST: ajouter une nouvelle station
export const addStation = async (station) => {
  try {
    const response = await axios.post(API_URL, station);
    return response.data;
  } catch (error) {
    console.error("Erreur API POST:", error);
    throw error;
  }
};

// GET: récupérer toutes les stations
export const getAllStations = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error("Erreur API GET:", error);
    throw error;
  }
};