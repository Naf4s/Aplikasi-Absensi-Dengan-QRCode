import axios from 'axios';

// configuration URL base for backend
// Replace 'localhost' with your backend server IP address accessible from your phone
<<<<<<< HEAD
const API_BASE_URL = 'http://localhost:8000/api'; // <-- Change this IP to your backend server IP
=======
const API_BASE_URL = '/api'; // <-- Change this IP to your backend server IP
>>>>>>> 076422649722e74d5fef7da17c3b2f2290cebdd4

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//Interceptor for add token JWT to every request
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
