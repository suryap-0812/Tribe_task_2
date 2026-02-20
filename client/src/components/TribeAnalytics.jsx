import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Trophy, Target, Clock, CheckCircle, Loader2 } from 'lucide-react'
import Card, { CardContent } from './ui/Card'
import Badge from './ui/Badge'
import { tribesAPI } from '../services/api'

export default function TribeAnalytics({ tribe, members }) {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true)
                const data = await tribesAPI.getTribeAnalytics(tribe._id || tribe.id)
                setAnalytics(data)
            } catch (error) {
                console.error('Failed to fetch tribe analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        if (tribe?._id || tribe?.id) {
            fetchAnalytics()
        }
    }, [tribe])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!analytics) return null

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const maxTaskValue = Math.max(...analytics.weeklyTasks, 1)
    const maxFocusValue = Math.max(...analytics.weeklyFocus, 1)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-gray-900">Tribe Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">Track performance and celebrate progress</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completion Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.completionRate}%</p>
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +5% from last week
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tasks Completed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalTasksCompleted}</p>
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +12 this week
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Focus Time</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.averageFocusTime}m</p>
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +18m from last week
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Streak</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.activeStreak} days</p>
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    🔥 Keep it going!
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Tasks Chart */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-semibold text-gray-900">Weekly Tasks Completed</h4>
                            <Badge variant="secondary">Last 7 days</Badge>
                        </div>
                        <div className="space-y-4">
                            {days.map((day, index) => (
                                <div key={day} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 font-medium">{day}</span>
                                        <span className="text-gray-900 font-semibold">{analytics.weeklyTasks[index]}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(analytics.weeklyTasks[index] / maxTaskValue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Focus Time Chart */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-semibold text-gray-900">Weekly Focus Time (minutes)</h4>
                            <Badge variant="secondary">Last 7 days</Badge>
                        </div>
                        <div className="space-y-4">
                            {days.map((day, index) => (
                                <div key={day} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 font-medium">{day}</span>
                                        <span className="text-gray-900 font-semibold">{analytics.weeklyFocus[index]}m</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(analytics.weeklyFocus[index] / maxFocusValue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Contribution Leaderboard
                        </h4>
                        <Badge variant="secondary">This Week</Badge>
                    </div>
                    <div className="space-y-3">
                        {analytics.memberContributions.slice(0, 5).map((contrib, index) => (
                            <div key={contrib.member._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-200 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                        {contrib.member.avatar || (contrib.member.name ? contrib.member.name.substring(0, 2).toUpperCase() : '??')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{contrib.member.name}</p>
                                        <p className="text-sm text-gray-500">{contrib.member.role || 'Member'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-900">{contrib.tasks}</p>
                                        <p className="text-xs text-gray-500">Tasks</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-900">{contrib.focusTime}m</p>
                                        <p className="text-xs text-gray-500">Focus</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-1">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                                    style={{ width: `${contrib.contributions}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 ml-2">{contrib.contributions}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
