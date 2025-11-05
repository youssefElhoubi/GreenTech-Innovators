import axios from "axios";

const API_URL = "http://localhost:8080/api/station";

// POST: ajouter une nouvelle station
export const addStation = async (station) => {
  try {
    const response = await axios.post("http://localhost:8080/api/station/esp32/saveMac", station);
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



export const updateStation = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la station:", error);
    throw error;
  }
};


// DELETE: supprimer une station
export const deleteStation = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la station:", error);
    throw error;
  }}