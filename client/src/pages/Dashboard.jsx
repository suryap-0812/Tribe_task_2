import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CheckCircle2, Users, Star, Target, Plus, ArrowRight } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Progress from '../components/ui/Progress'
import CreateTaskModal from '../components/CreateTaskModal'
import { useAuth } from '../context/AuthContext'
import { statsAPI, tasksAPI } from '../services/api'
import { formatTime } from '../utils/helpers'

const UPCOMING_LIMIT = 5

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [allTasks, setAllTasks] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    // Track tasks being toggled (for optimistic UI)
    const [togglingTasks, setTogglingTasks] = useState(new Set())
    // Track upcoming tasks that have been completed (to remove from view instantly)
    const [completedUpcoming, setCompletedUpcoming] = useState(new Set())

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true)
            // Fetch stats and ALL tasks in parallel
            const [statsData, tasksData] = await Promise.all([
                statsAPI.getDashboardStats(),
                tasksAPI.getTasks(),
            ])
            setStats(statsData || {
                dueToday: 0,
                focusTime: 0,
                tasksProgress: { completed: 0, total: 0 },
                activeTribes: 0,
            })
            setAllTasks(Array.isArray(tasksData) ? tasksData : [])
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
            setStats({ dueToday: 0, focusTime: 0, tasksProgress: { completed: 0, total: 0 }, activeTribes: 0 })
            setAllTasks([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadDashboardData()
    }, [loadDashboardData])

    // Toggle a Today task — stays visible, just updates completed state
    const handleTodayTaskToggle = async (taskId) => {
        if (togglingTasks.has(taskId)) return

        // Optimistic update
        setTogglingTasks(prev => new Set(prev).add(taskId))
        setAllTasks(prev =>
            prev.map(t =>
                (t._id || t.id) === taskId
                    ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'pending' }
                    : t
            )
        )

        try {
            await tasksAPI.completeTask(taskId)
            // Refresh stats counter
            const statsData = await statsAPI.getDashboardStats()
            if (statsData) setStats(statsData)
        } catch (error) {
            console.error('Failed to toggle task:', error)
            // Revert optimistic update on failure
            setAllTasks(prev =>
                prev.map(t =>
                    (t._id || t.id) === taskId
                        ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'pending' }
                        : t
                )
            )
        } finally {
            setTogglingTasks(prev => {
                const next = new Set(prev)
                next.delete(taskId)
                return next
            })
        }
    }

    // Complete an Upcoming (starred) task — disappears from dashboard immediately
    const handleUpcomingTaskComplete = async (taskId) => {
        if (togglingTasks.has(taskId)) return

        // Immediately hide from upcoming section
        setCompletedUpcoming(prev => new Set(prev).add(taskId))
        setTogglingTasks(prev => new Set(prev).add(taskId))

        try {
            await tasksAPI.completeTask(taskId)
            // Remove from allTasks state and refresh stats
            setAllTasks(prev => prev.filter(t => (t._id || t.id) !== taskId))
            const statsData = await statsAPI.getDashboardStats()
            if (statsData) setStats(statsData)
        } catch (error) {
            console.error('Failed to complete upcoming task:', error)
            // Revert — show it again
            setCompletedUpcoming(prev => {
                const next = new Set(prev)
                next.delete(taskId)
                return next
            })
        } finally {
            setTogglingTasks(prev => {
                const next = new Set(prev)
                next.delete(taskId)
                return next
            })
        }
    }

    const handleCreateTask = () => {
        loadDashboardData()
        setIsCreateModalOpen(false)
    }

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        )
    }

    // --- Today section: ALL tasks due today (including completed) ---
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTasks = allTasks.filter(task => {
        if (!task.dueDate) return false
        const due = new Date(task.dueDate)
        return due >= today && due < tomorrow
    })

    // --- Upcoming section: starred, not completed, due in future, not already completed via dashboard ---
    const allUpcomingStarred = allTasks.filter(task => {
        const taskId = task._id || task.id
        if (completedUpcoming.has(taskId)) return false
        if (task.completed) return false
        if (!task.starred) return false
        if (!task.dueDate) return false
        const due = new Date(task.dueDate)
        return due >= tomorrow
    })

    const visibleUpcoming = allUpcomingStarred.slice(0, UPCOMING_LIMIT)
    const extraUpcomingCount = allUpcomingStarred.length - UPCOMING_LIMIT

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
                <p className="text-gray-600 mt-1">
                    You have <span className="font-medium">{stats.dueToday} tasks</span> due today. Let's make it a good one.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Due Today</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.dueToday}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Focus Time</p>
                            <p className="text-3xl font-bold text-gray-900">{formatTime(stats.focusTime)}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tasks Progress</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.tasksProgress.completed} <span className="text-lg text-gray-400">/ {stats.tasksProgress.total}</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active Tribes</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.activeTribes}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Tasks */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>My Tasks</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary"
                                    onClick={() => navigate('/pending-tasks')}
                                >
                                    View all
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* ── TODAY SECTION ── */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Today</span>
                                    {todayTasks.length > 0 && (
                                        <span className="text-xs text-gray-400">
                                            ({todayTasks.filter(t => t.completed).length}/{todayTasks.length} done)
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {todayTasks.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No tasks due today 🎉</p>
                                    ) : (
                                        todayTasks.map(task => {
                                            const taskId = task._id || task.id
                                            const isCompleted = task.completed
                                            const isToggling = togglingTasks.has(taskId)

                                            return (
                                                <div
                                                    key={taskId}
                                                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isCompleted ? 'bg-gray-50' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompleted}
                                                        disabled={isToggling}
                                                        onChange={() => handleTodayTaskToggle(taskId)}
                                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-wait"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium transition-all duration-200 ${isCompleted
                                                            ? 'line-through text-gray-400'
                                                            : 'text-gray-900'
                                                            }`}>
                                                            {task.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {task.tribe && (
                                                                <span className={`text-xs ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    👥 {task.tribe.name || task.tribe}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge variant={isCompleted ? 'default' : task.priority}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            {/* ── UPCOMING SECTION (starred only, max 5) ── */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Upcoming</span>
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs text-gray-400">(Starred only)</span>
                                </div>

                                <div className="space-y-2">
                                    {visibleUpcoming.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No starred upcoming tasks</p>
                                    ) : (
                                        visibleUpcoming.map(task => {
                                            const taskId = task._id || task.id
                                            const isRemoving = completedUpcoming.has(taskId)

                                            return (
                                                <div
                                                    key={taskId}
                                                    className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 ${isRemoving
                                                        ? 'opacity-0 max-h-0 py-0 mb-0 overflow-hidden pointer-events-none'
                                                        : 'opacity-100 max-h-40'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={false}
                                                        onChange={() => handleUpcomingTaskComplete(taskId)}
                                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {task.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {task.tribe && (
                                                                <span className="text-xs text-gray-500">
                                                                    👥 {task.tribe.name || task.tribe}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-500">
                                                                📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                                        <Badge variant={task.priority}>{task.priority}</Badge>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}

                                    {/* "See more" link when there are more than 5 starred upcoming tasks */}
                                    {extraUpcomingCount > 0 && (
                                        <button
                                            onClick={() => navigate('/pending-tasks')}
                                            className="w-full flex items-center justify-center gap-1 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                        >
                                            See {extraUpcomingCount} more starred task{extraUpcomingCount > 1 ? 's' : ''}
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Overview */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start" variant="primary">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Post Daily Check-in
                            </Button>
                            <Button className="w-full justify-start" variant="ghost">
                                <Target className="w-4 h-4 mr-2" />
                                Start Focus Session
                            </Button>
                            <Button className="w-full justify-start" variant="ghost" onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Task
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Today's Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Tasks due today</span>
                                    <span className="text-sm font-medium">{stats.dueToday}</span>
                                </div>
                                <Progress value={stats.dueToday} max={10} />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">Focus session</span>
                                </div>
                                <p className="text-xs text-gray-500">• No active session</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">Progress</span>
                                </div>
                                <p className="text-xs text-gray-700">You've completed {stats.tasksProgress.completed} tasks. Keep it up!</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreateTask={handleCreateTask}
            />
        </div>
    )
}
