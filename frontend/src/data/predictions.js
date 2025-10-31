
import axios from "axios";
const API_URL = "http://localhost:8080/api/predictions";

export const getPredictions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
