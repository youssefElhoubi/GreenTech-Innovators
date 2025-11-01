// src/api/predictionsApi.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/predictions";

// Fetch all predictions
export const fetchPredictions = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des prédictions :", error);
    throw error;
  }
};
