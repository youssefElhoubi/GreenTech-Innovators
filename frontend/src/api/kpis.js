import axios from "axios";

const API_URL = "http://localhost:8080/api/predictions/kpis";

export const fetchingKpis = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des kpis :", error);
    throw error;
  }
};
