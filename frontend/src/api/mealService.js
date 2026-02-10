import apiClient from "./apiClient";

export const searchMeals = async (query) => {
    const response = await apiClient.get(`/meals/search?q=${query}`);
    return response;
};

export const getMealDetails = async (id) => {
    const response = await apiClient.get(`/meals/${id}`);
    return response;
};