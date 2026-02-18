import apiClient from "../client";
import { saveActivity } from './contentService';

export const getActivity = async (type = '', participants = '') => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (participants) params.append('participants', participants);

    const url = params.toString()
        ? `/api/hobbies/random?${params}`
        : `/api/hobbies/random`;

    return apiClient.get(url);
};

export { saveActivity };

export const getRandomActivity = getActivity;