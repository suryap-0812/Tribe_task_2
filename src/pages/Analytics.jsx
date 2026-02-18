import { useState } from 'react'
import { CheckCircle2, Calendar, Users, Flag, Filter, SortAsc } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Select, { SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/Select'
import { tasks } from '../data/mockData'

export default function Analytics() {
    const [sortBy, setSortBy] = useState('completedAt')
    const [filterPriority, setFilterPriority] = useState('all')
    const [filterTribe, setFilterTribe] = useState('all')

    // Get completed tasks
    let completedTasks = tasks.filter(task => task.completed)

    // Filter by priority
    if (filterPriority !== 'all') {
        completedTasks = completedTasks.filter(task => task.priority === filterPriority)
    }

    // Filter by tribe
    if (filterTribe !== 'all') {
        completedTasks = completedTasks.filter(task => task.tribe === filterTribe)
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

    // Get unique tribes
    const tribes = [...new Set(tasks.map(task => task.tribe))]

    // Calculate stats
    const totalCompleted = completedTasks.length
    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length
    const completedThisWeek = completedTasks.filter(t => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(t.completedAt) > weekAgo
    }).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Track your productivity and completed tasks</p>
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
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>

                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterTribe} onValueChange={setFilterTribe}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tribes</SelectItem>
                            {tribes.map(tribe => (
                                <SelectItem key={tribe} value={tribe}>{tribe}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 ml-auto">
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
                                                        <span>Tribe: {task.tribe}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Due: {task.dueDate.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Completed: {task.completedAt.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}</span>
                                                    </div>
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
