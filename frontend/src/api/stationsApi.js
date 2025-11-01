import axios from "axios";

const API_URL = "http://localhost:8080/api/station";

export const getAllStations = async () => {
  const response = await axios.get(`${API_URL}/all`);
  return response.data;
};

export const addStation = async (station) => {
  const response = await axios.post(API_URL, station);
  return response.data;
};
