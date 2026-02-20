import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Award, Clock, Target, Edit2, Shield, Bell, Palette, Loader2, Save, X } from 'lucide-react'
import Card, { CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { authAPI, statsAPI } from '../services/api'

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
    const [stats, setStats] = useState(null)
    const [dashboardData, setDashboardData] = useState(null)
    const [editData, setEditData] = useState({
        name: user.name || '',
        email: user.email || '',
        dailyFocusGoal: user.dailyFocusGoal || 120
    })

    useEffect(() => {
        fetchProfileData()
    }, [])

    const fetchProfileData = async () => {
        try {
            setLoading(true)
            const [userData, analyticsData, dashboard] = await Promise.all([
                authAPI.getCurrentUser(),
                statsAPI.getAnalytics(),
                statsAPI.getDashboardStats()
            ])
            setUser(userData)
            setStats(analyticsData)
            setDashboardData(dashboard)
            setEditData({
                name: userData.name,
                email: userData.email,
                dailyFocusGoal: userData.dailyFocusGoal || 120
            })
            // Update local storage user data
            localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
            console.error('Failed to fetch profile data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            const updatedUser = await authAPI.updateProfile(editData)
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setIsEditing(false)
            alert('Profile updated successfully!')
        } catch (error) {
            console.error('Failed to update profile:', error)
            alert(error.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const achievements = [
        { id: 1, name: 'Early Bird', icon: '🌅', description: 'Completed 10 tasks before 9 AM', unlocked: (stats?.tasksCompleted || 0) > 10 },
        { id: 2, name: 'Focus Master', icon: '🎯', description: '50 hours of focus time', unlocked: (stats?.totalFocusTime || 0) >= 3000 },
        { id: 3, name: 'Team Player', icon: '🤝', description: 'Join multiple tribes', unlocked: (user.tribes?.length || 0) >= 3 },
        { id: 4, name: 'Streak Champion', icon: '🔥', description: '7-day check-in streak', unlocked: (user.checkInStreak || 0) >= 7 },
        { id: 5, name: 'Task Ninja', icon: '⚡', description: '100 tasks completed', unlocked: (stats?.tasksCompleted || 0) >= 100 },
        { id: 6, name: 'Consistency King', icon: '👑', description: '30-day streak', unlocked: (user.checkInStreak || 0) >= 30 },
    ]

    const unlockedCount = achievements.filter(a => a.unlocked).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account and preferences</p>
                </div>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="primary"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="p-6">
                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        <p className="text-sm text-gray-500">Avatar generated from name</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="Your email"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Daily Focus Goal (mins)</label>
                                        <input
                                            type="number"
                                            value={editData.dailyFocusGoal}
                                            onChange={(e) => setEditData({ ...editData, dailyFocusGoal: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            min="30"
                                            max="720"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            type="submit"
                                            className="grow"
                                            disabled={saving}
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            Save Changes
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false)
                                                setEditData({
                                                    name: user.name,
                                                    email: user.email,
                                                    dailyFocusGoal: user.dailyFocusGoal || 120
                                                })
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                                        {user.name?.charAt(0) || 'U'}
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                                        {user.name}
                                    </h2>
                                    <p className="text-gray-600 text-sm flex items-center justify-center gap-1 mb-4">
                                        <Mail className="w-4 h-4" />
                                        {user.email}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <Calendar className="w-4 h-4" />
                                        <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    </div>

                                    <div className="w-full pt-4 border-t border-gray-200 space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Current Streak</span>
                                            <Badge variant="warning">
                                                🔥 {user.checkInStreak || 0} days
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Daily Focus Goal</span>
                                            <span className="font-semibold text-primary">{user.dailyFocusGoal || 120}m</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    {!isEditing && (
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
                                                <p className="text-sm text-gray-600">Total Tasks</p>
                                                <p className="text-xl font-bold text-gray-900">{stats?.totalTasks || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Focus Minutes</p>
                                                <p className="text-xl font-bold text-gray-900">{stats?.totalFocusTime || 0}m</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <User className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Tribes Joined</p>
                                                <p className="text-xl font-bold text-gray-900">{user.tribes?.length || 0}</p>
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
                                                <p className="text-xl font-bold text-gray-900">{unlockedCount}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Achievements */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                                <Badge>{unlockedCount} unlocked</Badge>
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
                                {dashboardData?.recentTasks?.length > 0 ? (
                                    dashboardData.recentTasks.map((task) => (
                                        <div key={task._id || task.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                                                <Target className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">Added task "{task.title}"</p>
                                                <p className="text-xs text-gray-500 mt-1">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                                )}
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
