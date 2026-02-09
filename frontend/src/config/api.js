// API Configuration for production and development

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiUrl = (endpoint) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
};

// API Client with HTTP methods
export const apiClient = {
    get: async (endpoint) => {
        const response = await fetch(apiUrl(endpoint), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    post: async (endpoint, data) => {
        const response = await fetch(apiUrl(endpoint), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    put: async (endpoint, data) => {
        const response = await fetch(apiUrl(endpoint), {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    delete: async (endpoint) => {
        const response = await fetch(apiUrl(endpoint), {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }
};

export default API_BASE_URL;

