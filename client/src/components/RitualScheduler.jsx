import { useState, useEffect } from 'react'
import { Calendar, Plus, Bell, Users, Award, Clock } from 'lucide-react'
import Card, { CardContent } from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { tribesAPI } from '../services/api'

export default function RitualScheduler({ tribeId, rituals: initialRituals, currentUser, isLeader, onSchedule, onAttend }) {
    const [rituals, setRituals] = useState(initialRituals || [])
    const [showCreateModal, setShowCreateModal] = useState(false)

    const fetchRituals = async () => {
        if (tribeId) {
            try {
                const data = await tribesAPI.getRituals(tribeId)
                setRituals(data.rituals || [])
            } catch (error) {
                console.error('Failed to fetch rituals:', error)
            }
        }
    }

    useEffect(() => {
        fetchRituals()
    }, [tribeId])
    const [viewMode, setViewMode] = useState('list') // list or calendar
    const [newRitual, setNewRitual] = useState({
        name: '',
        description: '',
        type: 'daily',
        time: '09:00',
        days: []
    })

    const handleMarkAttendance = async (ritualId) => {
        try {
            await tribesAPI.markRitualAttendance(tribeId, ritualId)
            await fetchRituals()

            if (onAttend) {
                onAttend(ritualId)
            }
        } catch (error) {
            console.error('Failed to mark attendance:', error)
            alert('Failed to mark attendance')
        }
    }

    const handleCreateRitual = async () => {
        if (newRitual.name.trim()) {
            try {
                // Prepare schedule object
                const schedule = {
                    type: newRitual.type,
                    time: newRitual.time,
                    days: newRitual.days
                }

                await tribesAPI.createRitual(tribeId, {
                    name: newRitual.name,
                    description: newRitual.description,
                    schedule
                })

                await fetchRituals()
                setNewRitual({ name: '', description: '', type: 'daily', time: '09:00', days: [] })
                setShowCreateModal(false)

                if (onSchedule) {
                    onSchedule()
                }
            } catch (error) {
                console.error('Failed to create ritual:', error)
                alert('Failed to create ritual')
            }
        }
    }

    const formatNextDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow'
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
    }

    const hasAttendedToday = (ritual) => {
        return ritual.attendance.some(a =>
            a.userId === currentUser._id &&
            new Date(a.date).toDateString() === new Date().toDateString()
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Tribe Rituals</h3>
                    <p className="text-sm text-gray-600 mt-1">Build consistency through shared practices</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>
                    {isLeader && (
                        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Ritual
                        </Button>
                    )}
                </div>
            </div>

            {/* Rituals List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rituals.map(ritual => {
                    const attended = hasAttendedToday(ritual)

                    return (
                        <Card key={ritual._id || ritual.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">{ritual.badge}</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{ritual.name}</h4>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {ritual.schedule.type === 'custom'
                                                        ? ritual.schedule.days.join(', ')
                                                        : ritual.schedule.type}
                                                </p>
                                            </div>
                                        </div>
                                        <Bell className="w-4 h-4 text-gray-400" />
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 line-clamp-2">{ritual.description}</p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-900">{ritual.streak}</p>
                                            <p className="text-xs text-gray-500">Streak</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-900">{ritual.participants}</p>
                                            <p className="text-xs text-gray-500">Members</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-900">{ritual.schedule.time}</p>
                                            <p className="text-xs text-gray-500">Time</p>
                                        </div>
                                    </div>

                                    {/* Next & Action */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">Next: {formatNextDate(ritual.nextDate)}</span>
                                        </div>
                                        {attended ? (
                                            <Badge variant="success" className="bg-green-100 text-green-700">
                                                ✓ Attended
                                            </Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => handleMarkAttendance(ritual._id || ritual.id)}
                                            >
                                                Mark Attended
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Motivational Message */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                    💜 Missed a ritual? No worries! Resume whenever you are ready. Consistency &gt; Perfection.
                </p>
            </div>

            {/* Create Ritual Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Ritual</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ritual Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newRitual.name}
                                        onChange={(e) => setNewRitual({ ...newRitual, name: e.target.value })}
                                        placeholder="e.g., Morning Check-in"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newRitual.description}
                                        onChange={(e) => setNewRitual({ ...newRitual, description: e.target.value })}
                                        placeholder="What's this ritual about?"
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Frequency
                                        </label>
                                        <select
                                            value={newRitual.type}
                                            onChange={(e) => setNewRitual({ ...newRitual, type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Time
                                        </label>
                                        <input
                                            type="time"
                                            value={newRitual.time}
                                            onChange={(e) => setNewRitual({ ...newRitual, time: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowCreateModal(false)
                                            setNewRitual({ name: '', description: '', type: 'daily', time: '09:00', days: [] })
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateRitual} disabled={!newRitual.name.trim()}>
                                        Create Ritual
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
