// Mock user data
export const currentUser = {
    id: 1,
    name: 'John',
    email: 'john@example.com',
    avatar: 'JD',
    checkInStreak: 5,
}

// Mock tasks data
export const tasks = [
    {
        id: 1,
        title: 'Complete project proposal',
        description: 'Finalize the Q1 project proposal',
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date(),
        tribe: 'Work Team',
        tribeRole: 'Leader',
        isGroupTask: false,
        assignedRole: 'leader',
        completed: false,
        starred: false,
        completedAt: null,
        tags: ['RECOMMENDED TODAY'],
    },
    {
        id: 2,
        title: 'Team sync meeting prep',
        description: 'Prepare agenda for team sync',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(),
        tribe: 'Work Team',
        tribeRole: 'Leader',
        isGroupTask: true,
        assignedRole: 'leader',
        completed: false,
        starred: false,
        completedAt: null,
        tags: ['GROUP'],
    },
    {
        id: 3,
        title: 'Review code changes',
        description: 'Review PR #234',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        tribe: 'Dev Squad',
        tribeRole: 'Member',
        isGroupTask: false,
        assignedRole: 'member',
        completed: false,
        starred: true,
        completedAt: null,
        tags: [],
    },
    {
        id: 4,
        title: 'Update documentation',
        description: 'Update API documentation',
        priority: 'low',
        status: 'pending',
        dueDate: new Date(Date.now() + 172800000), // 2 days from now
        tribe: 'Dev Squad',
        tribeRole: 'Member',
        isGroupTask: true,
        assignedRole: 'member',
        completed: false,
        starred: true,
        completedAt: null,
        tags: ['GROUP'],
    },
    {
        id: 5,
        title: 'Fix login bug',
        description: 'Resolve authentication issue',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() - 86400000), // Yesterday
        tribe: 'Dev Squad',
        completed: true,
        starred: false,
        completedAt: new Date(Date.now() - 43200000), // 12 hours ago
        tags: [],
    },
    {
        id: 6,
        title: 'Design new landing page',
        description: 'Create mockups for homepage redesign',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date(Date.now() - 172800000), // 2 days ago
        tribe: 'Work Team',
        completed: true,
        starred: false,
        completedAt: new Date(Date.now() - 86400000), // Yesterday
        tags: [],
    },
    {
        id: 7,
        title: 'Client presentation',
        description: 'Present Q1 results to client',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() - 259200000), // 3 days ago
        tribe: 'Work Team',
        completed: true,
        starred: false,
        completedAt: new Date(Date.now() - 259200000),
        tags: [],
    },
]

// Mock tribes data
export const tribes = [
    {
        id: 1,
        name: 'Work Team',
        description: 'Product development team',
        members: 8,
        activeTasks: 12,
        activeToday: 3,
        role: 'Leader',
        color: 'blue',
    },
    {
        id: 2,
        name: 'Dev Squad',
        description: 'Engineering collaboration',
        members: 5,
        activeTasks: 8,
        activeToday: 2,
        role: 'Member',
        color: 'purple',
    },
    {
        id: 3,
        name: 'Study Group',
        description: 'Learning and growth',
        members: 4,
        activeTasks: 6,
        activeToday: 1,
        role: 'Member',
        color: 'green',
    },
]

// Mock focus sessions data
export const focusSessions = [
    {
        id: 1,
        title: 'Deep work on project',
        duration: 135, // in minutes
        date: new Date(Date.now() - 86400000), // Yesterday
        status: 'completed',
    },
    {
        id: 2,
        title: 'Code review session',
        duration: 90,
        date: new Date(Date.now() - 172800000), // 2 days ago
        status: 'completed',
    },
    {
        id: 3,
        title: 'Documentation writing',
        duration: 105,
        date: new Date(Date.now() - 259200000), // 3 days ago
        status: 'completed',
    },
]

// Mock stats
export const stats = {
    dueToday: 2,
    focusTime: 135, // in minutes
    tasksProgress: {
        completed: 12,
        total: 16,
    },
    activeTribes: 3,
    dailyFocusGoal: 180, // in minutes
    sessionsCompleted: 3,
}
