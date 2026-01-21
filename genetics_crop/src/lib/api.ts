
const API_BASE_URL = 'http://localhost:8000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || `API request failed: ${response.statusText}`);
    }

    return response.json();
}

export const cropApi = {
    getAll: () => apiRequest('/crops'),
    create: (data: any) => apiRequest('/crops', { method: 'POST', body: JSON.stringify(data) }),
    predict: (data: any) => apiRequest('/predict', { method: 'POST', body: JSON.stringify(data) }),
    predictLive: (data: any) => apiRequest('/predict/live', { method: 'POST', body: JSON.stringify(data) }),
    getDashboardStats: () => apiRequest('/dashboard-stats'),
    getTraits: () => apiRequest('/traits'),
    getClimate: () => apiRequest('/climate'),
    getAllPredictions: () => apiRequest('/admin/predictions'),
    getUsers: (role?: string) => apiRequest(`/users${role ? `?role=${role}` : ''}`),
    generateReport: () => apiRequest('/admin/generate-report', { method: 'POST' }),
    uploadCsv: (formData: FormData) => {
        return fetch(`${API_BASE_URL}/upload-csv`, {
            method: 'POST',
            body: formData,
        }).then(res => res.json());
    }
};
