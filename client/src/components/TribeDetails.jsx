import { useState } from 'react'
import { ArrowLeft, Settings, MoreVertical, Shield, Clock, Users as UsersIcon, Trophy, BookOpen, Calendar, BarChart3, Trash2, Target, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { tribesAPI } from '../services/api'
import Card, { CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import * as Tabs from '@radix-ui/react-tabs'
import TribeChat from './TribeChat'
import TribeMembers from './TribeMembers'
import ProblemSolvingBoard from './ProblemSolvingBoard'
import BuddyMode from './BuddyMode'
import RitualScheduler from './RitualScheduler'
import TribeAnalytics from './TribeAnalytics'
import Achievements from './Achievements'
import ResourceLibrary from './ResourceLibrary'

export default function TribeDetails({ tribe: initialTribe, onBack }) {
    const [tribe, setTribe] = useState(initialTribe)
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Get current user from localStorage
    const storedUser = localStorage.getItem('user')
    const currentUser = storedUser ? JSON.parse(storedUser) : null

    // Map members to flat structure for child components
    const tribeMembers = (tribe.members || []).map(m => ({
        ...(m.user || {}),
        role: m.role,
        joinedAt: m.joinedAt,
    }))

    // Tribe stats for overview
    const stats = [
        { label: 'Members', value: tribe.memberCount || tribe.members?.length || 0, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Tasks', value: tribe.activeTasks || 0, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Focus Time', value: tribe.focusTime || '0h', icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Rituals', value: tribe.ritualsCount || 0, icon: Award, color: 'text-orange-600', bg: 'bg-orange-50' }
    ]

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            navigate('/my-tribes')
        }
    }

    const handleDeleteTribe = async () => {
        if (window.confirm('Are you sure you want to delete this tribe? This action cannot be undone.')) {
            try {
                setLoading(true)
                await tribesAPI.deleteTribe(tribe._id)
                handleBack()
            } catch (error) {
                console.error('Failed to delete tribe:', error)
                alert('Failed to delete tribe')
            } finally {
                setLoading(false)
            }
        }
    }

    const handleInviteMember = async (newMember) => {
        try {
            const updatedTribe = await tribesAPI.addMember(tribe._id, { email: newMember.email })
            setTribe(updatedTribe)
        } catch (error) {
            console.error('Failed to invite member:', error)
            alert(error.message || 'Failed to invite member')
        }
    }

    const handleRemoveMember = async (userId) => {
        try {
            const updatedTribe = await tribesAPI.removeMember(tribe._id, userId)
            setTribe(updatedTribe)
        } catch (error) {
            console.error('Failed to remove member:', error)
            alert('Failed to remove member')
        }
    }

    const rules = tribe.rules || []
    const rituals = tribe.rituals || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Tribes</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {/* Delete button only for Leader */}
                    {tribeMembers.find(m => m._id === currentUser?._id)?.role === 'Leader' && (
                        <button
                            onClick={handleDeleteTribe}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                            title="Delete Tribe"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Tribe Info */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{tribe.name}</h1>
                <p className="text-gray-600 mt-1">
                    {tribeMembers.length} members • Active {tribe.activeToday > 0 ? `${tribe.activeToday * 10} mins ago` : 'recently'}
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="p-4 flex items-center gap-3">
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex gap-4 border-b border-gray-200 overflow-x-auto">
                    <Tabs.Trigger
                        value="overview"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Overview
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="chat"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            💬
                            Chat
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="members"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            <UsersIcon className="w-4 h-4" />
                            Members
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="problem-solving"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            💡
                            Problems
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="buddy"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            🤝
                            Buddy
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="rituals"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Rituals
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="analytics"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="achievements"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Achievements
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="resources"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary whitespace-nowrap"
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Resources
                        </div>
                    </Tabs.Trigger>
                </Tabs.List>

                {/* Overview Tab */}
                <Tabs.Content value="overview" className="mt-6 space-y-6">
                    {/* Rules & Expectations */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold text-gray-900">Rules & Expectations</h3>
                            </div>
                            {rules.length > 0 ? (
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {rules.map((rule, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-600">No rules or expectations defined yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tribe Rituals */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold text-gray-900">Tribe Rituals</h3>
                            </div>
                            {rituals.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {rituals.map((ritual, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">{ritual.name}</h4>
                                                <Badge variant="default" className="text-xs">{ritual.frequency}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{ritual.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">No rituals defined yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Buddy Mode Preview */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <UsersIcon className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold text-gray-900">Buddy Mode</h3>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {currentUser?.avatar}
                                        </div>
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium -ml-2">
                                            AC
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Ready to pair up</p>
                                        <p className="text-sm text-gray-600">Find a buddy for focused work</p>
                                    </div>
                                </div>
                                <Button onClick={() => setActiveTab('buddy')}>Start Session</Button>
                            </div>
                        </CardContent>
                    </Card>
                </Tabs.Content>

                {/* Chat Tab */}
                <Tabs.Content value="chat" className="mt-6">
                    <TribeChat
                        tribeId={tribe._id}
                        currentUser={currentUser}
                        onSendMessage={(msg) => console.log('Sent:', msg)}
                    />
                </Tabs.Content>

                {/* Members Tab */}
                <Tabs.Content value="members" className="mt-6">
                    <TribeMembers
                        tribeId={tribe._id}
                        members={tribe.members}
                        currentUser={currentUser}
                        onInvite={(email) => tribesAPI.addMember(tribe._id, email)}
                        onRemove={(userId) => tribesAPI.removeMember(tribe._id, userId)}
                    />
                </Tabs.Content>

                {/* Problem Solving Tab */}
                <Tabs.Content value="problem-solving" className="mt-6">
                    <ProblemSolvingBoard
                        tribeId={tribe._id}
                        problems={[]} // Problems should be fetched by the component
                        currentUser={currentUser}
                    />
                </Tabs.Content>

                {/* Buddy Mode Tab */}
                <Tabs.Content value="buddy" className="mt-6">
                    <BuddyMode
                        tribeId={tribe._id}
                        members={tribeMembers}
                        currentUser={currentUser}
                    />
                </Tabs.Content>

                {/* Rituals Tab */}
                <Tabs.Content value="rituals" className="mt-6">
                    <RitualScheduler
                        tribeId={tribe._id}
                        currentUser={currentUser}
                        onSchedule={() => console.log('Ritual scheduled')}
                    />
                </Tabs.Content>

                {/* Analytics Tab */}
                <Tabs.Content value="analytics" className="mt-6">
                    <TribeAnalytics
                        tribe={tribe}
                        members={tribeMembers}
                    />
                </Tabs.Content>

                {/* Achievements Tab */}
                <Tabs.Content value="achievements" className="mt-6">
                    <Achievements
                        tribeId={tribe.id}
                    />
                </Tabs.Content>

                {/* Resources Tab */}
                <Tabs.Content value="resources" className="mt-6">
                    <ResourceLibrary
                        tribeId={tribe.id}
                        currentUser={currentUser}
                    />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}
