import { useState } from 'react'
import { User, Mail, Calendar, Award, Clock, Target, Edit2, Shield, Bell, Palette } from 'lucide-react'
import Card, { CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false)
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

    // Mock user stats
    const userStats = {
        tasksCompleted: 142,
        focusHours: 87,
        currentStreak: 12,
        tribesJoined: 3,
        achievements: 8,
        weeklyGoal: 85
    }

    const achievements = [
        { id: 1, name: 'Early Bird', icon: '🌅', description: 'Completed 10 tasks before 9 AM', unlocked: true },
        { id: 2, name: 'Focus Master', icon: '🎯', description: '50 hours of focus time', unlocked: true },
        { id: 3, name: 'Team Player', icon: '🤝', description: 'Joined 3 tribes', unlocked: true },
        { id: 4, name: 'Streak Champion', icon: '🔥', description: '7-day check-in streak', unlocked: true },
        { id: 5, name: 'Task Ninja', icon: '⚡', description: '100 tasks completed', unlocked: true },
        { id: 6, name: 'Consistency King', icon: '👑', description: '30-day streak', unlocked: false },
    ]

    const recentActivity = [
        { id: 1, type: 'task', description: 'Completed "Design review meeting"', time: '2 hours ago' },
        { id: 2, type: 'focus', description: 'Finished 45-min focus session', time: '5 hours ago' },
        { id: 3, type: 'tribe', description: 'Joined "Product Team" tribe', time: '1 day ago' },
        { id: 4, type: 'achievement', description: 'Unlocked "Task Ninja" achievement', time: '2 days ago' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account and preferences</p>
                </div>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? 'secondary' : 'primary'}
                >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                                    {currentUser.avatar || currentUser.name?.charAt(0) || 'U'}
                                </div>

                                {/* Name & Email */}
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {currentUser.name || 'User Name'}
                                </h2>
                                <p className="text-gray-600 text-sm flex items-center gap-1 mb-4">
                                    <Mail className="w-4 h-4" />
                                    {currentUser.email || 'user@example.com'}
                                </p>

                                {/* Member Since */}
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <Calendar className="w-4 h-4" />
                                    <span>Member since Jan 2024</span>
                                </div>

                                {/* Quick Stats */}
                                <div className="w-full pt-4 border-t border-gray-200 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Current Streak</span>
                                        <Badge variant="warning">
                                            🔥 {userStats.currentStreak} days
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Weekly Progress</span>
                                        <span className="font-semibold text-primary">{userStats.weeklyGoal}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Target className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Tasks Completed</p>
                                            <p className="text-xl font-bold text-gray-900">{userStats.tasksCompleted}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Focus Hours</p>
                                            <p className="text-xl font-bold text-gray-900">{userStats.focusHours}h</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <User className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Tribes</p>
                                            <p className="text-xl font-bold text-gray-900">{userStats.tribesJoined}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <Award className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Achievements</p>
                                            <p className="text-xl font-bold text-gray-900">{userStats.achievements}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Achievements */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                                <Badge>{userStats.achievements} unlocked</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className={`p-4 rounded-lg border-2 transition-all ${achievement.unlocked
                                                ? 'bg-gradient-to-br from-primary-50 to-white border-primary-200'
                                                : 'bg-gray-50 border-gray-200 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-3xl">{achievement.icon}</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {achievement.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">{achievement.description}</p>
                                                {achievement.unlocked && (
                                                    <Badge variant="success" className="mt-2">
                                                        Unlocked
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'task' ? 'bg-green-100' :
                                                activity.type === 'focus' ? 'bg-blue-100' :
                                                    activity.type === 'tribe' ? 'bg-purple-100' :
                                                        'bg-yellow-100'
                                            }`}>
                                            {activity.type === 'task' && <Target className="w-5 h-5 text-green-600" />}
                                            {activity.type === 'focus' && <Clock className="w-5 h-5 text-blue-600" />}
                                            {activity.type === 'tribe' && <User className="w-5 h-5 text-purple-600" />}
                                            {activity.type === 'achievement' && <Award className="w-5 h-5 text-yellow-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Notifications</p>
                                            <p className="text-sm text-gray-600">Manage your notification preferences</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Configure</Button>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Palette className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Appearance</p>
                                            <p className="text-sm text-gray-600">Customize theme and colors</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Customize</Button>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Privacy & Security</p>
                                            <p className="text-sm text-gray-600">Control your privacy settings</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Manage</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
