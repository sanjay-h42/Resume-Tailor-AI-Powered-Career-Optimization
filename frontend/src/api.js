import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // FastAPI backend
});

export const submitOptimization = async (data) => {
    const response = await api.post('/optimize/', data);
    return response.data;
};

export const checkStatus = async (id) => {
    const response = await api.get(`/optimize/${id}`);
    return response.data;
};

export default api;
