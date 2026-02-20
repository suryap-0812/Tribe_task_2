import { useState, useEffect } from 'react'
import { Plus, Filter, Circle, Star, Calendar, Trash2, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select, { SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/Select'
import CreateTaskModal from '../components/CreateTaskModal'
import { tasksAPI } from '../services/api'
import * as Tabs from '@radix-ui/react-tabs'

export default function PendingTasks() {
    const [activeTab, setActiveTab] = useState('today')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({
        type: 'all', // all, personal, tribe
        priority: 'all-priorities',
        status: 'all-status'
    })

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            setLoading(true)
            const allTasks = await tasksAPI.getTasks({ completed: false })
            setTasks(allTasks)
        } catch (error) {
            console.error('Error fetching tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    const handleCreateTask = async (newTask) => {
        try {
            await tasksAPI.createTask(newTask)
            setIsCreateModalOpen(false)
            fetchTasks() // Refresh tasks
        } catch (error) {
            console.error('Error creating task:', error)
        }
    }

    const handleCompleteTask = async (taskId) => {
        try {
            await tasksAPI.completeTask(taskId)
            fetchTasks()
        } catch (error) {
            console.error('Error completing task:', error)
        }
    }

    const handleToggleStar = async (taskId) => {
        try {
            await tasksAPI.toggleStar(taskId)
            fetchTasks()
        } catch (error) {
            console.error('Error toggling star:', error)
        }
    }

    const handleDeleteTask = async (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await tasksAPI.deleteTask(taskId)
                fetchTasks()
            } catch (error) {
                console.error('Error deleting task:', error)
            }
        }
    }

    // Filter tasks based on active filters
    const filteredTasks = tasks.filter(task => {
        // 1. Status Check: Only show PENDING tasks (not completed)
        if (task.completed) return false

        // 2. Type filter
        if (filter.type === 'personal' && task.tribe && task.tribe !== 'Personal') return false
        if (filter.type === 'tribe' && (!task.tribe || task.tribe === 'Personal')) return false

        // 3. Priority filter
        if (filter.priority !== 'all-priorities' && task.priority !== filter.priority) return false

        // 4. Status Dropdown filter
        if (filter.status !== 'all-status' && task.status !== filter.status) return false

        // 5. Time Tab filter
        const taskDate = task.dueDate ? new Date(task.dueDate) : null
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const endOfToday = new Date(today)
        endOfToday.setHours(23, 59, 59, 999)

        const endOfWeek = new Date(today)
        endOfWeek.setDate(today.getDate() + 7)
        endOfWeek.setHours(23, 59, 59, 999)

        if (activeTab === 'today') {
            // Show overdue tasks + tasks due today
            if (!taskDate) return false // No date -> Later
            return taskDate <= endOfToday
        } else if (activeTab === 'week') {
            // Show tasks due tomorrow -> end of week
            if (!taskDate) return false
            return taskDate > endOfToday && taskDate <= endOfWeek
        } else if (activeTab === 'later') {
            // Show tasks due after this week OR no due date
            if (!taskDate) return true
            return taskDate > endOfWeek
        }

        return true
    })

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50'
            case 'medium':
                return 'text-amber-600 bg-amber-50'
            case 'low':
                return 'text-blue-600 bg-blue-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const formatDate = (date) => {
        if (!date) return 'No date'
        const d = new Date(date)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pending Tasks ({filteredTasks.length})</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track your personal and tribe tasks</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="space-y-4">
                    {/* Time Filter Tabs */}
                    <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-sm text-gray-600 min-w-12">Show:</span>
                            <Tabs.List className="inline-flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto whitespace-nowrap">
                                <Tabs.Trigger
                                    value="today"
                                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600"
                                >
                                    Today
                                </Tabs.Trigger>
                                <Tabs.Trigger
                                    value="week"
                                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600"
                                >
                                    This Week
                                </Tabs.Trigger>
                                <Tabs.Trigger
                                    value="later"
                                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600"
                                >
                                    Later
                                </Tabs.Trigger>
                            </Tabs.List>
                        </div>
                    </Tabs.Root>

                    {/* Additional Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 min-w-fit">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Filter:</span>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                            <Button
                                variant={filter.type === 'all' ? 'outline' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter({ ...filter, type: 'all' })}
                                className="h-8 text-xs sm:text-sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={filter.type === 'personal' ? 'outline' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter({ ...filter, type: 'personal' })}
                                className="h-8 text-xs sm:text-sm"
                            >
                                Personal
                            </Button>
                            <Button
                                variant={filter.type === 'tribe' ? 'outline' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter({ ...filter, type: 'tribe' })}
                                className="h-8 text-xs sm:text-sm"
                            >
                                Tribe
                            </Button>
                        </div>

                        <div className="flex flex-1 items-center gap-2 min-w-full xs:min-w-fit">
                            <Select value={filter.priority} onValueChange={(value) => setFilter({ ...filter, priority: value })}>
                                <SelectTrigger className="flex-1 xs:w-[140px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-priorities">All Priorities</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                                <SelectTrigger className="flex-1 xs:w-[120px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-status">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tasks List or Empty State */}
            {loading ? (
                <Card className="py-16">
                    <div className="text-center text-gray-600">Loading tasks...</div>
                </Card>
            ) : filteredTasks.length === 0 ? (
                <Card className="py-16">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Circle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters or create a new task</p>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                        </Button>
                        <p className="text-sm text-gray-500 mt-6">Showing 0 of {tasks.length} tasks</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredTasks.map((task) => (
                        <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <button
                                    onClick={() => handleCompleteTask(task.id)}
                                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 hover:border-primary flex items-center justify-center transition-colors"
                                >
                                    {task.completed && <Check className="w-3 h-3 text-primary" />}
                                </button>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-gray-900">{task.title}</h3>
                                            {task.description && (
                                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-600">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(task.dueDate)}
                                                    </span>
                                                )}
                                                {task.tribe && (
                                                    <span className="text-xs text-gray-600">
                                                        👥 {task.tribe.name || (typeof task.tribe === 'string' ? task.tribe : 'Tribe')}
                                                        {task.tribeRole && (
                                                            <span className="ml-1 text-gray-400">
                                                                ({task.tribeRole})
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                                {task.isGroupTask && (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                                                        GROUP
                                                    </span>
                                                )}
                                                {task.assignedRole && task.assignedRole !== 'personal' && (
                                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${task.assignedRole === 'leader'
                                                        ? 'bg-yellow-50 text-yellow-700'
                                                        : task.assignedRole === 'delegate'
                                                            ? 'bg-purple-50 text-purple-600'
                                                            : 'bg-green-50 text-green-600'
                                                        }`}>
                                                        {task.assignedRole.toUpperCase()}
                                                    </span>
                                                )}
                                                {task.tags && task.tags.length > 0 && task.tags.filter(tag => tag !== 'GROUP').map(tag => (
                                                    <span key={tag} className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleStar(task.id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Star className={`w-4 h-4 ${task.starred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    <p className="text-sm text-gray-500 text-center pt-4">
                        Showing {filteredTasks.length} of {tasks.length} tasks
                    </p>
                </div>
            )}

            {/* Create Task Modal */}
            <CreateTaskModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreateTask={handleCreateTask}
            />
        </div>
    )
}
