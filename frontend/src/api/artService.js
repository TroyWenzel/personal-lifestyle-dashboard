import apiClient from "./apiClient";

export const searchArt = async (query) => {
    const response = await apiClient.get(`/art/search?query=${query}`);
    return response;
};