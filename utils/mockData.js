export const mockUser = {
    _id: 'mock-user-id-123',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    checkInStreak: 5,
    dailyFocusGoal: 4,
    isAdmin: false
};

export const mockTasks = [
    {
        _id: 'task-1',
        title: 'Complete project proposal',
        description: 'Draft the initial proposal for the new client project',
        status: 'pending', // pending, completed
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        tribe: 'tribe-1',
        user: 'mock-user-id-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'task-2',
        title: 'Review code changes',
        description: 'Check the pull requests for the latest features',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date().toISOString(), // today
        tribe: 'tribe-1',
        user: 'mock-user-id-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'task-3',
        title: 'Prepare presentation',
        description: 'Create slides for the weekly meeting',
        status: 'pending',
        priority: 'low',
        dueDate: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
        tribe: 'tribe-2',
        user: 'mock-user-id-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const mockTribes = [
    {
        _id: 'tribe-1',
        name: 'Productivity Squad',
        description: 'A tribe for people who want to get things done.',
        members: ['mock-user-id-123', 'user-2', 'user-3'],
        admin: 'mock-user-id-123',
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'tribe-2',
        name: 'Coding Enthusiasts',
        description: 'Discussing code, bugs, and features.',
        members: ['mock-user-id-123', 'user-4'],
        admin: 'user-4',
        isPrivate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const mockFocusSessions = [
    {
        _id: 'session-1',
        user: 'mock-user-id-123',
        task: 'task-1',
        startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        endTime: new Date().toISOString(),
        duration: 60, // minutes
        status: 'completed',
        notes: 'Made good progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const mockStats = {
    totalFocusTime: 120, // minutes
    tasksCompleted: 15,
    streak: 5,
    points: 350,
    level: 3,
    weeklyActivity: [10, 20, 15, 30, 25, 10, 10] // minutes per day
};
