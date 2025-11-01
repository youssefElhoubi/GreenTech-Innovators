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
