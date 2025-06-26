import axios from 'axios';

// configuration URL base for backend
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//Interceptro for add token JWT to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Pull token form localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Add to Authorization header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default api;