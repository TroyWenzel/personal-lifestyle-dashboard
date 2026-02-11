import apiClient from "./apiClient";

export const searchWeather = async (location) => {
    const response = await apiClient.get(`/weather/search?city=${location}`);
    return response;
};