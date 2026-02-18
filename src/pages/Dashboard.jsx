import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle2, Users, Star, Target, Plus } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Progress from '../components/ui/Progress'
import CreateTaskModal from '../components/CreateTaskModal'
import { useAuth } from '../context/AuthContext'
import { statsAPI, tasksAPI } from '../services/api'
import { formatTime } from '../utils/helpers'

export default function Dashboard() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [completingTasks, setCompletingTasks] = useState(new Set())

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const data = await statsAPI.getDashboardStats()
            if (data) {
                setStats(data)
                setTasks(data.recentTasks || [])
            } else {
                throw new Error('No data received')
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
            // Set default empty stats so UI still renders
            setStats({
                dueToday: 0,
                focusTime: 0,
                tasksProgress: { completed: 0, total: 0 },
                activeTribes: 0
            })
            setTasks([])
        } finally {
            setLoading(false)
        }
    }

    const handleTaskToggle = async (taskId) => {
        // Add to completing set for animation
        setCompletingTasks(prev => new Set(prev).add(taskId))

        // Wait for animation to complete before API call
        setTimeout(async () => {
            try {
                await tasksAPI.completeTask(taskId)
                loadDashboardData() // Reload data
            } catch (error) {
                console.error('Failed to toggle task:', error)
                // Remove from completing set if failed
                setCompletingTasks(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(taskId)
                    return newSet
                })
            }
        }, 300) // Match CSS transition duration
    }

    const handleCreateTask = () => {
        loadDashboardData() // Reload after creating task
        setIsCreateModalOpen(false)
    }

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        )
    }

    const todayTasks = tasks.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        const today = new Date()
        return dueDate.toDateString() === today.toDateString()
    })

    const upcomingTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false
        const dueDate = new Date(task.dueDate)
        const today = new Date()
        const isUpcoming = dueDate > today && dueDate.toDateString() !== today.toDateString()
        return isUpcoming && task.starred
    })

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
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
                                <Button variant="ghost" size="sm" className="text-primary">
                                    View all
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Today Section */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Today</span>
                                </div>

                                <div className="space-y-3">
                                    {todayTasks.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No tasks due today</p>
                                    ) : (
                                        todayTasks.map((task) => {
                                            const taskId = task.id || task._id
                                            return (
                                                <div
                                                    key={taskId}
                                                    className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${task.completed ? 'opacity-60' : ''
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => handleTaskToggle(taskId)}
                                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                                                            }`}>
                                                            {task.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {task.tribe && (
                                                                <span className={`text-xs ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    👥 {task.tribe.name || task.tribe}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge variant={task.priority}>{task.priority}</Badge>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Section - Starred Only */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Upcoming</span>
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs text-gray-400">(Starred only)</span>
                                </div>

                                <div className="space-y-3">
                                    {upcomingTasks.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No starred upcoming tasks</p>
                                    ) : (
                                        upcomingTasks.map((task) => {
                                            const taskId = task._id || task.id
                                            const isCompleting = completingTasks.has(taskId)
                                            return (
                                                <div
                                                    key={taskId}
                                                    className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 ${isCompleting ? 'opacity-0 scale-95 h-0 py-0 mb-0 overflow-hidden' : 'opacity-100 scale-100'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompleting}
                                                        onChange={() => handleTaskToggle(taskId)}
                                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${isCompleting ? 'line-through text-gray-400' : 'text-gray-900'
                                                            }`}>
                                                            {task.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {task.tribe && (
                                                                <span className={`text-xs ${isCompleting ? 'text-gray-400' : 'text-gray-500'
                                                                    }`}>
                                                                    👥 {task.tribe.name || task.tribe}
                                                                </span>
                                                            )}
                                                            <span className={`text-xs ${isCompleting ? 'text-gray-400' : 'text-gray-500'
                                                                }`}>
                                                                📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge variant={task.priority}>{task.priority}</Badge>
                                                </div>
                                            )
                                        })
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
