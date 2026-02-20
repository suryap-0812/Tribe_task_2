import { useState, useEffect } from 'react'
import { Users, Layout, Shield, Trash2, Search, BarChart3, AlertCircle, Loader2, MoreVertical, ExternalLink } from 'lucide-react'
import Card, { CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { adminAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AdminPortal() {
    const { user: currentUser } = useAuth()
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [tribes, setTribes] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview') // overview, users, tribes
    const [searchQuery, setSearchQuery] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAdminData()

        // Auto-refresh every 30 seconds for real-time feel
        const interval = setInterval(fetchAdminData, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchAdminData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [statsData, usersData, tribesData] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers(),
                adminAPI.getTribes()
            ])
            setStats(statsData)
            setUsers(usersData)
            setTribes(tribesData)
        } catch (err) {
            setError(err.message || 'Failed to fetch admin data')
            console.error('Admin portal error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
        try {
            await adminAPI.deleteUser(id)
            setUsers(users.filter(u => u._id !== id))
            fetchAdminData() // Refresh stats
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteTribe = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tribe? All associated data will be lost.')) return
        try {
            await adminAPI.deleteTribe(id)
            setTribes(tribes.filter(t => t._id !== id))
            fetchAdminData() // Refresh stats
        } catch (err) {
            alert(err.message)
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredTribes = tribes.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t._id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        Admin Portal
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        System monitoring and management dashboard
                        {stats?.lastUpdated && (
                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100 font-medium">
                                Last synced: {new Date(stats.lastUpdated).toLocaleTimeString()}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={fetchAdminData}>
                        Refresh Data
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'users', label: 'Users', icon: Users },
                    { id: 'tribes', label: 'Tribes', icon: Layout }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="blue" trend={`+${stats?.growth.newUsers} this month`} />
                        <StatCard icon={Layout} label="Total Tribes" value={stats?.totalTribes} color="purple" trend={`+${stats?.growth.newTribes} this month`} />
                        <StatCard icon={BarChart3} label="Completed Tasks" value={stats?.totalTasks} color="green" />
                        <StatCard icon={Loader2} label="Focus Sessions" value={stats?.totalFocusSessions} color="orange" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-bold mb-4">Recent Users</h3>
                                <div className="divide-y divide-gray-100">
                                    {users.slice(0, 5).map(user => (
                                        <div key={user._id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-[10px]">{new Date(user.createdAt).toLocaleDateString()}</Badge>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full mt-4 text-primary" onClick={() => setActiveTab('users')}>View All Users</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-bold mb-4">Top Tribes</h3>
                                <div className="divide-y divide-gray-100">
                                    {tribes.slice(0, 5).map(tribe => (
                                        <div key={tribe._id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner border border-gray-100" style={{ backgroundColor: `${tribe.color}20` }}>
                                                    🎯
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{tribe.name}</p>
                                                    <p className="text-xs text-gray-500">{tribe.members.length} members</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-400">ID: {tribe._id.slice(-6)}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full mt-4 text-primary" onClick={() => setActiveTab('tribes')}>View All Tribes</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {(activeTab === 'users' || activeTab === 'tribes') && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'users' ? "Search users by name or email..." : "Search tribes by name or ID..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>

                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            {activeTab === 'users' ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tribes</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.isAdmin ? (
                                                        <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200">Admin</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">User</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {user.currentTribeCount || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {currentUser?._id !== user._id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tribe</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Creator</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Members</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Privacy</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredTribes.map(tribe => (
                                            <tr key={tribe._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center" style={{ backgroundColor: `${tribe.color}20` }}>
                                                            🏘️
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{tribe.name}</p>
                                                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">ID: {tribe._id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-800">{tribe.createdBy?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">{tribe.createdBy?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                    {tribe.members.length}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {tribe.isPrivate ? (
                                                        <Badge variant="outline" className="text-gray-500">Private</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">Public</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteTribe(tribe._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Tribe"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color, trend }) {
    const colors = {
        blue: 'from-blue-50 to-indigo-50 text-blue-600 border-blue-100',
        purple: 'from-purple-50 to-fuchsia-50 text-purple-600 border-purple-100',
        green: 'from-emerald-50 to-green-50 text-emerald-600 border-green-100',
        orange: 'from-orange-50 to-amber-50 text-orange-600 border-orange-100'
    }

    return (
        <Card className={`bg-gradient-to-br ${colors[color]} border shadow-sm`}>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
                        <p className="text-3xl font-black mt-1">{value || 0}</p>
                        {trend && <p className="text-[10px] font-bold mt-1 opacity-80">{trend}</p>}
                    </div>
                    <div className={`p-3 rounded-2xl bg-white/60 shadow-inner`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
