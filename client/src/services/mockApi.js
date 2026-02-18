import {
    currentUser as initialUser,
    tasks as initialTasks,
    tribes as initialTribes,
    focusSessions as initialFocusSessions,
    stats as initialStats
} from '../data/mockData';

// LocalStorage keys
const STORAGE_KEYS = {
    TASKS: 'tribetask_mock_tasks',
    TRIBES: 'tribetask_mock_tribes',
    SESSIONS: 'tribetask_mock_sessions',
    USER: 'tribetask_mock_user',
    COUNTERS: 'tribetask_mock_counters'
};

// Deep clone utility to avoid mutation issues
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// LocalStorage helpers
const loadFromStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
    }
    return deepClone(defaultValue);
};

const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

// Initialize data from localStorage or use defaults
let mockUser = loadFromStorage(STORAGE_KEYS.USER, initialUser);
let mockTasks = loadFromStorage(STORAGE_KEYS.TASKS, initialTasks);
let mockTribes = loadFromStorage(STORAGE_KEYS.TRIBES, initialTribes);
let mockFocusSessions = loadFromStorage(STORAGE_KEYS.SESSIONS, initialFocusSessions);
let mockStats = deepClone(initialStats);

// Load ID counters from localStorage
const loadedCounters = loadFromStorage(STORAGE_KEYS.COUNTERS, {
    taskId: Math.max(...mockTasks.map(t => t.id), 0) + 1,
    tribeId: Math.max(...mockTribes.map(t => t.id), 0) + 1,
    sessionId: Math.max(...mockFocusSessions.map(s => s.id), 0) + 1
});

let taskIdCounter = loadedCounters.taskId;
let tribeIdCounter = loadedCounters.tribeId;
let sessionIdCounter = loadedCounters.sessionId;

// Save counters to localStorage
const saveCounters = () => {
    saveToStorage(STORAGE_KEYS.COUNTERS, {
        taskId: taskIdCounter,
        tribeId: tribeIdCounter,
        sessionId: sessionIdCounter
    });
};

// Simulate network delay
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Recalculate stats based on current data
const calculateStats = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dueToday = mockTasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= todayStart && taskDate < new Date(todayStart.getTime() + 86400000);
    }).length;

    const todaySessions = mockFocusSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= todayStart;
    });

    const focusTime = todaySessions.reduce((total, session) => {
        return total + (session.duration || 0);
    }, 0);

    const completed = mockTasks.filter(t => t.completed).length;
    const total = mockTasks.length;

    mockStats = {
        dueToday,
        focusTime,
        tasksProgress: { completed, total },
        activeTribes: mockTribes.length,
        dailyFocusGoal: 180,
        sessionsCompleted: todaySessions.length,
    };

    return mockStats;
};

// Mock Auth API
export const mockAuthAPI = {
    register: async (data) => {
        await delay();
        const user = {
            _id: 'mock-user-' + Date.now(),
            name: data.name,
            email: data.email,
            avatar: data.name.substring(0, 2).toUpperCase(),
            checkInStreak: 0,
        };
        mockUser = user;
        saveToStorage(STORAGE_KEYS.USER, user);
        return {
            ...user,
            token: 'mock-token-' + Date.now(),
        };
    },

    login: async (data) => {
        await delay();
        const user = {
            _id: 'mock-user-' + Date.now(),
            name: data.email.split('@')[0],
            email: data.email,
            avatar: data.email.substring(0, 2).toUpperCase(),
            checkInStreak: mockUser.checkInStreak || 5,
        };
        mockUser = user;
        saveToStorage(STORAGE_KEYS.USER, user);
        return {
            ...user,
            token: 'mock-token-' + Date.now(),
        };
    },

    logout: async () => {
        await delay();
        return { message: 'Logged out successfully' };
    },

    getCurrentUser: async () => {
        await delay();
        return mockUser;
    },
};

// Mock Tasks API
export const mockTasksAPI = {
    getTasks: async (params) => {
        await delay();
        let filteredTasks = [...mockTasks];

        // Filter by status
        if (params?.status) {
            filteredTasks = filteredTasks.filter(task => task.status === params.status);
        }

        // Filter by completed
        if (params?.completed !== undefined) {
            filteredTasks = filteredTasks.filter(task => task.completed === params.completed);
        }

        // Filter by tribe
        if (params?.tribe) {
            filteredTasks = filteredTasks.filter(task => task.tribe === params.tribe);
        }

        // Filter by starred
        if (params?.starred) {
            filteredTasks = filteredTasks.filter(task => task.starred);
        }

        console.log('📋 Returning tasks:', filteredTasks.length, 'tasks with filters:', params);
        return filteredTasks;
    },

    getTask: async (id) => {
        await delay();
        const task = mockTasks.find(t => t.id === parseInt(id));
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    },

    createTask: async (data) => {
        await delay();
        const newTask = {
            id: taskIdCounter++,
            title: data.title,
            description: data.description || '',
            priority: data.priority || 'medium',
            status: data.status || 'pending',
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            tribe: data.tribe || null,
            tribeRole: data.tribeRole || null,
            isGroupTask: data.isGroupTask || false,
            assignedRole: data.assignedRole || 'personal',
            completed: false,
            starred: data.starred || false,
            completedAt: null,
            tags: data.tags || [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockTasks.unshift(newTask);
        saveToStorage(STORAGE_KEYS.TASKS, mockTasks);
        saveCounters();
        calculateStats();
        console.log('✅ Created task:', newTask.title);
        return newTask;
    },

    updateTask: async (id, data) => {
        await delay();
        const index = mockTasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Task not found');
        }
        mockTasks[index] = {
            ...mockTasks[index],
            ...data,
            updatedAt: new Date(),
        };
        saveToStorage(STORAGE_KEYS.TASKS, mockTasks);
        calculateStats();
        console.log('✅ Updated task:', mockTasks[index].title);
        return mockTasks[index];
    },

    deleteTask: async (id) => {
        await delay();
        const index = mockTasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Task not found');
        }
        const deletedTask = mockTasks[index];
        mockTasks.splice(index, 1);
        saveToStorage(STORAGE_KEYS.TASKS, mockTasks);
        calculateStats();
        console.log('🗑️ Deleted task:', deletedTask.title);
        return { message: 'Task deleted successfully' };
    },

    completeTask: async (id) => {
        await delay();
        const index = mockTasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Task not found');
        }
        mockTasks[index] = {
            ...mockTasks[index],
            completed: !mockTasks[index].completed,
            status: !mockTasks[index].completed ? 'completed' : 'pending',
            completedAt: !mockTasks[index].completed ? new Date() : null,
            updatedAt: new Date(),
        };
        saveToStorage(STORAGE_KEYS.TASKS, mockTasks);
        calculateStats();
        console.log('✅ Toggled completion for task:', mockTasks[index].title);
        return mockTasks[index];
    },

    toggleStar: async (id) => {
        await delay();
        const index = mockTasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Task not found');
        }
        mockTasks[index] = {
            ...mockTasks[index],
            starred: !mockTasks[index].starred,
            updatedAt: new Date(),
        };
        saveToStorage(STORAGE_KEYS.TASKS, mockTasks);
        console.log('⭐ Toggled star for task:', mockTasks[index].title);
        return mockTasks[index];
    },
};

// Mock Tribes API
export const mockTribesAPI = {
    getTribes: async () => {
        await delay();
        console.log('👥 Returning tribes:', mockTribes.length);
        return mockTribes;
    },

    getTribe: async (id) => {
        await delay();
        const tribe = mockTribes.find(t => t.id === parseInt(id));
        if (!tribe) {
            throw new Error('Tribe not found');
        }
        return tribe;
    },

    createTribe: async (data) => {
        await delay();
        const newTribe = {
            id: tribeIdCounter++,
            name: data.name,
            description: data.description || '',
            members: 1,
            activeTasks: 0,
            activeToday: 0,
            role: 'Leader',
            color: data.color || 'blue',
            createdAt: new Date(),
        };
        mockTribes.push(newTribe);
        saveToStorage(STORAGE_KEYS.TRIBES, mockTribes);
        saveCounters();
        calculateStats();
        console.log('✅ Created tribe:', newTribe.name);
        return newTribe;
    },

    updateTribe: async (id, data) => {
        await delay();
        const index = mockTribes.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Tribe not found');
        }
        mockTribes[index] = {
            ...mockTribes[index],
            ...data,
            updatedAt: new Date(),
        };
        saveToStorage(STORAGE_KEYS.TRIBES, mockTribes);
        console.log('✅ Updated tribe:', mockTribes[index].name);
        return mockTribes[index];
    },

    deleteTribe: async (id) => {
        await delay();
        const index = mockTribes.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Tribe not found');
        }
        const deletedTribe = mockTribes[index];
        mockTribes.splice(index, 1);
        saveToStorage(STORAGE_KEYS.TRIBES, mockTribes);
        calculateStats();
        console.log('🗑️ Deleted tribe:', deletedTribe.name);
        return { message: 'Tribe deleted successfully' };
    },

    addMember: async (id, data) => {
        await delay();
        const index = mockTribes.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Tribe not found');
        }
        mockTribes[index] = {
            ...mockTribes[index],
            members: mockTribes[index].members + 1,
        };
        saveToStorage(STORAGE_KEYS.TRIBES, mockTribes);
        return mockTribes[index];
    },

    removeMember: async (id, userId) => {
        await delay();
        const index = mockTribes.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Tribe not found');
        }
        mockTribes[index] = {
            ...mockTribes[index],
            members: Math.max(1, mockTribes[index].members - 1),
        };
        saveToStorage(STORAGE_KEYS.TRIBES, mockTribes);
        return mockTribes[index];
    },
};

// Mock Focus Sessions API
export const mockFocusSessionsAPI = {
    getFocusSessions: async (params) => {
        await delay();
        let filtered = [...mockFocusSessions];

        if (params?.status) {
            filtered = filtered.filter(s => s.status === params.status);
        }

        console.log('🎯 Returning focus sessions:', filtered.length);
        return filtered;
    },

    getFocusSession: async (id) => {
        await delay();
        const session = mockFocusSessions.find(s => s.id === parseInt(id));
        if (!session) {
            throw new Error('Focus session not found');
        }
        return session;
    },

    createFocusSession: async (data) => {
        await delay();
        const newSession = {
            id: sessionIdCounter++,
            title: data.title,
            duration: data.duration || 0,
            date: new Date(),
            status: 'active',
            taskId: data.taskId || null,
        };
        mockFocusSessions.unshift(newSession);
        saveToStorage(STORAGE_KEYS.SESSIONS, mockFocusSessions);
        saveCounters();
        calculateStats();
        console.log('✅ Created focus session:', newSession.title);
        return newSession;
    },

    updateFocusSession: async (id, data) => {
        await delay();
        const index = mockFocusSessions.findIndex(s => s.id === parseInt(id));
        if (index === -1) {
            throw new Error('Focus session not found');
        }
        mockFocusSessions[index] = {
            ...mockFocusSessions[index],
            ...data,
        };
        saveToStorage(STORAGE_KEYS.SESSIONS, mockFocusSessions);
        calculateStats();
        console.log('✅ Updated focus session:', mockFocusSessions[index].title);
        return mockFocusSessions[index];
    },

    completeFocusSession: async (id, data) => {
        await delay();
        const index = mockFocusSessions.findIndex(s => s.id === parseInt(id));
        if (index === -1) {
            throw new Error('Focus session not found');
        }
        mockFocusSessions[index] = {
            ...mockFocusSessions[index],
            status: 'completed',
            duration: data.duration || mockFocusSessions[index].duration,
            completedAt: new Date(),
        };
        saveToStorage(STORAGE_KEYS.SESSIONS, mockFocusSessions);
        calculateStats();
        console.log('✅ Completed focus session:', mockFocusSessions[index].title);
        return mockFocusSessions[index];
    },

    deleteFocusSession: async (id) => {
        await delay();
        const index = mockFocusSessions.findIndex(s => s.id === parseInt(id));
        if (index === -1) {
            throw new Error('Focus session not found');
        }
        const deletedSession = mockFocusSessions[index];
        mockFocusSessions.splice(index, 1);
        saveToStorage(STORAGE_KEYS.SESSIONS, mockFocusSessions);
        calculateStats();
        console.log('🗑️ Deleted focus session:', deletedSession.title);
        return { message: 'Focus session deleted successfully' };
    },
};

// Mock Stats API
export const mockStatsAPI = {
    getDashboardStats: async () => {
        await delay();
        const stats = calculateStats();

        // Include recent tasks (last 10 tasks, prioritizing today's and starred)
        const today = new Date();
        const todayTasks = mockTasks.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate.toDateString() === today.toDateString();
        });

        const starredTasks = mockTasks.filter(task => task.starred && !task.completed);
        const otherTasks = mockTasks.filter(task => !task.completed && !todayTasks.includes(task) && !starredTasks.includes(task));

        const recentTasks = [...todayTasks, ...starredTasks, ...otherTasks].slice(0, 10);

        console.log('📊 Returning stats with', recentTasks.length, 'recent tasks');
        return {
            ...stats,
            recentTasks
        };
    },

    getAnalytics: async () => {
        await delay();
        // Generate some mock analytics data
        return {
            weeklyTasks: [3, 5, 4, 6, 8, 5, 7],
            weeklyFocus: [120, 150, 90, 180, 135, 160, 140],
            tasksByPriority: {
                high: mockTasks.filter(t => t.priority === 'high' && !t.completed).length,
                medium: mockTasks.filter(t => t.priority === 'medium' && !t.completed).length,
                low: mockTasks.filter(t => t.priority === 'low' && !t.completed).length,
            },
            completionRate: mockTasks.length > 0
                ? (mockTasks.filter(t => t.completed).length / mockTasks.length) * 100
                : 0,
        };
    },
};

// Log initial state
console.log('🔧 Mock API initialized with localStorage persistence');
console.log('📋 Tasks loaded:', mockTasks.length);
console.log('👥 Tribes loaded:', mockTribes.length);
console.log('🎯 Focus sessions loaded:', mockFocusSessions.length);

export default {
    auth: mockAuthAPI,
    tasks: mockTasksAPI,
    tribes: mockTribesAPI,
    focusSessions: mockFocusSessionsAPI,
    stats: mockStatsAPI,
};
