import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Calendar, Users, Flag, Filter, SortAsc, Loader2 } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Select, { SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/Select'
import { tasksAPI, tribesAPI } from '../services/api'

export default function Analytics() {
    const [sortBy, setSortBy] = useState('completedAt')
    const [filterPriority, setFilterPriority] = useState('all')
    const [filterTribe, setFilterTribe] = useState('all')
    const [allTasks, setAllTasks] = useState([])
    const [userTribes, setUserTribes] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [tasksData, tribesData] = await Promise.all([
                tasksAPI.getTasks({ status: 'completed' }),
                tribesAPI.getTribes()
            ])
            setAllTasks(Array.isArray(tasksData) ? tasksData : [])
            setUserTribes(Array.isArray(tribesData) ? tribesData : [])
        } catch (error) {
            console.error('Failed to fetch analytics data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Get completed tasks
    let completedTasks = allTasks.filter(task => task.completed)

    // Filter by priority
    if (filterPriority !== 'all') {
        completedTasks = completedTasks.filter(task => task.priority === filterPriority)
    }

    // Filter by tribe
    if (filterTribe !== 'all') {
        completedTasks = completedTasks.filter(task => {
            const tribeId = task.tribe?._id || task.tribe
            return tribeId === filterTribe
        })
    }

    // Sort tasks
    completedTasks = [...completedTasks].sort((a, b) => {
        if (sortBy === 'completedAt') {
            return new Date(b.completedAt) - new Date(a.completedAt)
        } else if (sortBy === 'dueDate') {
            return new Date(b.dueDate) - new Date(a.dueDate)
        } else if (sortBy === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return 0
    })

    // Get unique tribes from completed tasks (for fallback)
    const uniqueTribes = [...new Set(allTasks
        .filter(t => t.tribe)
        .map(task => task.tribe?.name || task.tribeName || (typeof task.tribe === 'string' ? task.tribe : 'Unknown'))
    )]

    // Calculate stats
    const totalCompleted = completedTasks.length
    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length
    const completedThisWeek = completedTasks.filter(t => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(t.completedAt) > weekAgo
    }).length

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading your production analytics...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Track your productivity and completed tasks</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Completed</p>
                            <p className="text-3xl font-bold text-gray-900">{totalCompleted}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">This Week</p>
                            <p className="text-3xl font-bold text-gray-900">{completedThisWeek}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">High Priority</p>
                            <p className="text-3xl font-bold text-gray-900">{highPriorityCompleted}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                            <Flag className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters and Sort */}
            <Card>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 min-w-fit">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Filter:</span>
                            </div>
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                                <SelectTrigger className="flex-1 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 sm:hidden">Tribe:</span>
                            <Select value={filterTribe} onValueChange={setFilterTribe}>
                                <SelectTrigger className="flex-1 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tribes</SelectItem>
                                    {userTribes.map(tribe => (
                                        <SelectItem key={tribe._id} value={tribe._id}>{tribe.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto border-t lg:border-t-0 pt-4 lg:pt-0">
                        <SortAsc className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="completedAt">Completed Date</SelectItem>
                                <SelectItem value="dueDate">Due Date</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Completed Tasks List */}
            <Card>
                <CardHeader>
                    <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {completedTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No completed tasks found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {completedTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary-50/50 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-start gap-3 flex-1">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>

                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Flag className="w-3 h-3" />
                                                        <span>Priority:</span>
                                                        <Badge variant={task.priority} className="text-xs">{task.priority}</Badge>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        <span>Tribe: {task.tribe?.name || 'Personal'}</span>
                                                    </div>

                                                    {task.dueDate && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}</span>
                                                        </div>
                                                    )}

                                                    {task.completedAt && (
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Completed: {new Date(task.completedAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
