import axios from 'axios';

// Real API implementation
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send session cookies with every request
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';

        // If unauthorized, clear token and redirect to login
        if (error.response?.status === 401) {
            // Only redirect if not already on login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(new Error(message));
    }
);

// Real Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Real Tasks API
export const tasksAPI = {
    getTasks: (params) => api.get('/tasks', { params }),
    getTask: (id) => api.get(`/tasks/${id}`),
    createTask: (data) => api.post('/tasks', data),
    updateTask: (id, data) => api.put(`/tasks/${id}`, data),
    deleteTask: (id) => api.delete(`/tasks/${id}`),
    completeTask: (id) => api.patch(`/tasks/${id}/complete`),
    toggleStar: (id) => api.patch(`/tasks/${id}/star`),
};

// Real Tribes API
export const tribesAPI = {
    getTribes: () => api.get('/tribes'),
    getTribe: (id) => api.get(`/tribes/${id}`),
    createTribe: (data) => api.post('/tribes', data),
    updateTribe: (id, data) => api.put(`/tribes/${id}`, data),
    deleteTribe: (id) => api.delete(`/tribes/${id}`),
    addMember: (id, data) => api.post(`/tribes/${id}/members`, data),
    removeMember: (id, userId) => api.delete(`/tribes/${id}/members/${userId}`),
    joinTribe: (id) => api.post(`/tribes/${id}/join`),
    searchTribe: (id) => api.get(`/tribes/search/${id}`),
    requestJoin: (id) => api.post(`/tribes/${id}/request`),
    getJoinRequests: (id) => api.get(`/tribes/${id}/requests`),
    approveJoinRequest: (id, userId) => api.post(`/tribes/${id}/requests/${userId}/approve`),
    rejectJoinRequest: (id, userId) => api.post(`/tribes/${id}/requests/${userId}/reject`),

    // Messages
    getMessages: (tribeId, params) => api.get(`/tribes/${tribeId}/messages`, { params }),
    sendMessage: (tribeId, data) => api.post(`/tribes/${tribeId}/messages`, data),
    addReaction: (tribeId, messageId, data) => api.post(`/tribes/${tribeId}/messages/${messageId}/reactions`, data),
    updateMessage: (tribeId, messageId, data) => api.put(`/tribes/${tribeId}/messages/${messageId}`, data),
    deleteMessage: (tribeId, messageId) => api.delete(`/tribes/${tribeId}/messages/${messageId}`),

    // Problems
    getProblems: (tribeId, params) => api.get(`/tribes/${tribeId}/problems`, { params }),
    createProblem: (tribeId, data) => api.post(`/tribes/${tribeId}/problems`, data),
    addSolution: (tribeId, problemId, data) => api.post(`/tribes/${tribeId}/problems/${problemId}/solutions`, data),
    voteSolution: (tribeId, problemId, solutionId) => api.post(`/tribes/${tribeId}/problems/${problemId}/solutions/${solutionId}/vote`),
    updateProblemStatus: (tribeId, problemId, data) => api.patch(`/tribes/${tribeId}/problems/${problemId}/status`, data),
    deleteProblem: (tribeId, problemId) => api.delete(`/tribes/${tribeId}/problems/${problemId}`),

    // Buddy Sessions
    getBuddySessions: (tribeId, params) => api.get(`/tribes/${tribeId}/buddy-sessions`, { params }),
    getActiveBuddySession: (tribeId) => api.get(`/tribes/${tribeId}/buddy-sessions/active`),
    startBuddySession: (tribeId, data) => api.post(`/tribes/${tribeId}/buddy-sessions`, data),
    updateBuddySessionStatus: (tribeId, sessionId, data) => api.patch(`/tribes/${tribeId}/buddy-sessions/${sessionId}/status`, data),
    endBuddySession: (tribeId, sessionId, data) => api.post(`/tribes/${tribeId}/buddy-sessions/${sessionId}/end`, data),
    getBuddySessionHistory: (tribeId, params) => api.get(`/tribes/${tribeId}/buddy-sessions/history`, { params }),

    // Rituals
    getRituals: (tribeId, params) => api.get(`/tribes/${tribeId}/rituals`, { params }),
    createRitual: (tribeId, data) => api.post(`/tribes/${tribeId}/rituals`, data),
    markRitualAttendance: (tribeId, ritualId) => api.post(`/tribes/${tribeId}/rituals/${ritualId}/attendance`),
    joinRitual: (tribeId, ritualId) => api.post(`/tribes/${tribeId}/rituals/${ritualId}/join`),
    deleteRitual: (tribeId, ritualId) => api.delete(`/tribes/${tribeId}/rituals/${ritualId}`),

    // Resources
    getResources: (tribeId, params) => api.get(`/tribes/${tribeId}/resources`, { params }),
    uploadResource: (tribeId, data) => api.post(`/tribes/${tribeId}/resources`, data),
    downloadResource: (tribeId, resourceId) => api.post(`/tribes/${tribeId}/resources/${resourceId}/download`),
    deleteResource: (tribeId, resourceId) => api.delete(`/tribes/${tribeId}/resources/${resourceId}`),
};

// Real Focus Sessions API
export const focusSessionsAPI = {
    getFocusSessions: (params) => api.get('/focus-sessions', { params }),
    getFocusSession: (id) => api.get(`/focus-sessions/${id}`),
    createFocusSession: (data) => api.post('/focus-sessions', data),
    updateFocusSession: (id, data) => api.put(`/focus-sessions/${id}`, data),
    completeFocusSession: (id, data) => api.patch(`/focus-sessions/${id}/complete`, data),
    deleteFocusSession: (id) => api.delete(`/focus-sessions/${id}`),
};

// Real Stats API
export const statsAPI = {
    getDashboardStats: () => api.get('/stats/dashboard'),
    getAnalytics: () => api.get('/stats/analytics'),
};

export default api;
