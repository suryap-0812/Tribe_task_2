import { useState } from 'react'
import { UserPlus, MoreVertical, Mail, Shield, Crown, Star, Circle } from 'lucide-react'
import Card, { CardContent } from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { tribesAPI } from '../services/api'

export default function TribeMembers({ tribeId, members, currentUser, onInvite, onRemove }) {
    const [viewMode, setViewMode] = useState('grid') // grid or list
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [isInviting, setIsInviting] = useState(false)

    const roles = ['all', 'leader', 'member', 'contributor']
    const statuses = ['all', 'online', 'away', 'offline']

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'leader':
                return <Crown className="w-4 h-4 text-yellow-500" />
            case 'admin':
                return <Shield className="w-4 h-4 text-blue-500" />
            default:
                return <Star className="w-4 h-4 text-gray-400" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'offline': return 'bg-gray-400'
            case 'away': return 'bg-yellow-500'
            case 'busy': return 'bg-red-500'
            default: return 'bg-gray-400'
        }
    }

    const getStatusText = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Offline'
    }

    const filteredMembers = members.filter(member => {
        const roleMatch = filterRole === 'all' || member.role?.toLowerCase() === filterRole
        const statusMatch = filterStatus === 'all' || member.status?.toLowerCase() === filterStatus
        return roleMatch && statusMatch
    })

    const handleInvite = async () => {
        if (inviteEmail.trim() && tribeId) {
            setIsInviting(true)
            try {
                await tribesAPI.addMember(tribeId, inviteEmail)
                setInviteEmail('')
                setShowInviteModal(false)
                // Ideally we should tell the parent to re-fetch tribe data
                if (onInvite) onInvite({ email: inviteEmail })
            } catch (error) {
                console.error('Failed to invite member:', error)
                alert('Failed to invite member. Make sure the user exists.')
            } finally {
                setIsInviting(false)
            }
        }
    }

    const handleRemove = async (userId) => {
        if (window.confirm('Are you sure you want to remove this member?') && tribeId) {
            try {
                await tribesAPI.removeMember(tribeId, userId)
                if (onRemove) onRemove(userId)
            } catch (error) {
                console.error('Failed to remove member:', error)
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Tribe Members</h3>
                    <p className="text-sm text-gray-600 mt-1">{members.length} total members</p>
                </div>
                <Button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Role:</span>
                    <div className="flex gap-2">
                        {roles.map(role => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterRole === role
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <div className="flex gap-2">
                        {statuses.map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${filterStatus === status
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status !== 'all' && (
                                    <Circle className={`w-2 h-2 ${getStatusColor(status)} rounded-full`} fill="currentColor" />
                                )}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="ml-auto flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Members Display */}
            {filteredMembers.length === 0 ? (
                <Card className="py-16">
                    <div className="text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
                        <p className="text-gray-600">Try adjusting your filters</p>
                    </div>
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map(member => (
                        <Card key={member._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                                {member.avatar || (member.name ? member.name.substring(0, 2).toUpperCase() : '??')}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                                {getRoleIcon(member.role)}
                                            </div>
                                            <p className="text-xs text-gray-500">{getStatusText(member.status)}</p>
                                        </div>
                                    </div>

                                    {member._id !== currentUser._id && (
                                        <div className="relative group">
                                            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>
                                            <div className="hidden group-hover:block absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                                    View Profile
                                                </button>
                                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                                    Send Message
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Badge variant={member.role === 'leader' ? 'default' : 'secondary'} className="text-xs">
                                        {member.role || 'Member'}
                                    </Badge>

                                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500">Tasks</p>
                                            <p className="text-lg font-semibold text-gray-900">{member.tasksCompleted || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Focus Time</p>
                                            <p className="text-lg font-semibold text-gray-900">{member.focusTime || 0}m</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-200">
                            {filteredMembers.map(member => (
                                <div key={member._id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                                    {member.avatar || (member.name ? member.name.substring(0, 2).toUpperCase() : '??')}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                                                    {getRoleIcon(member.role)}
                                                    <Badge variant="secondary" className="text-xs">
                                                        {member.role || 'Member'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-900">{member.tasksCompleted || 0}</p>
                                                <p className="text-xs text-gray-500">Tasks</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-900">{member.focusTime || 0}m</p>
                                                <p className="text-xs text-gray-500">Focus</p>
                                            </div>
                                            <Badge variant={member.status === 'online' ? 'success' : 'secondary'}>
                                                {getStatusText(member.status)}
                                            </Badge>

                                            {member._id !== currentUser._id && (
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Member</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="member@example.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowInviteModal(false)
                                            setInviteEmail('')
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting}>
                                        {isInviting ? 'Inviting...' : 'Send Invite'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
