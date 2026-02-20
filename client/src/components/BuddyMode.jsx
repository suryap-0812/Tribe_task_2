import { useState, useEffect } from 'react'
import { Users, Play, Pause, StopCircle, MessageCircle, Clock, Target, Award } from 'lucide-react'
import Card, { CardContent } from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { tribesAPI } from '../services/api'

export default function BuddyMode({ tribeId, members, currentUser, onStartSession, onEndSession }) {
    const [activeBuddy, setActiveBuddy] = useState(null)
    const [sessionStatus, setSessionStatus] = useState('inactive')
    const [sessionTime, setSessionTime] = useState(0)
    const [showFindBuddy, setShowFindBuddy] = useState(false)
    const [buddyMessage, setBuddyMessage] = useState('')
    const [chatMessages, setChatMessages] = useState([])
    const [sessionHistory, setSessionHistory] = useState([])
    const [activeSession, setActiveSession] = useState(null)

    const fetchSessionData = async () => {
        if (tribeId) {
            try {
                const active = await tribesAPI.getActiveBuddySession(tribeId)
                if (active && active.session) {
                    setActiveSession(active.session)
                    setActiveBuddy(active.session.buddy)
                    setSessionStatus(active.session.status)
                    // Calculate session time if it's been running
                    const startTime = new Date(active.session.startTime).getTime()
                    const now = new Date().getTime()
                    setSessionTime(Math.floor((now - startTime) / 1000))
                }

                const history = await tribesAPI.getBuddySessionHistory(tribeId)
                setSessionHistory(history.sessions || [])
            } catch (error) {
                console.error('Failed to fetch buddy session data:', error)
            }
        }
    }

    useEffect(() => {
        fetchSessionData()
    }, [tribeId])

    useEffect(() => {
        let interval
        if (sessionStatus === 'active') {
            interval = setInterval(() => {
                setSessionTime(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [sessionStatus])

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStartSession = async (buddy) => {
        try {
            const data = await tribesAPI.startBuddySession(tribeId, { buddyId: buddy._id })
            setActiveSession(data.session)
            setActiveBuddy(buddy)
            setSessionStatus('active')
            setSessionTime(0)
            setShowFindBuddy(false)

            if (onStartSession) {
                onStartSession(buddy)
            }
        } catch (error) {
            console.error('Failed to start session:', error)
            alert('Failed to start session')
        }
    }

    const handleTogglePause = async () => {
        const newStatus = sessionStatus === 'active' ? 'paused' : 'active'
        try {
            await tribesAPI.updateBuddySessionStatus(tribeId, activeSession._id, { status: newStatus })
            setSessionStatus(newStatus)
        } catch (error) {
            console.error('Failed to update session status:', error)
        }
    }

    const handleEndSession = async () => {
        if (window.confirm('End buddy session?')) {
            try {
                await tribesAPI.endBuddySession(tribeId, activeSession._id)
                await fetchSessionData() // Refresh history and clear active session
                setActiveBuddy(null)
                setActiveSession(null)
                setSessionStatus('inactive')
                setSessionTime(0)
                setChatMessages([])

                if (onEndSession) {
                    onEndSession()
                }
            } catch (error) {
                console.error('Failed to end session:', error)
                alert('Failed to end session')
            }
        }
    }

    const handleSendMessage = () => {
        if (buddyMessage.trim()) {
            setChatMessages([...chatMessages, {
                id: Date.now(),
                sender: currentUser,
                content: buddyMessage,
                timestamp: new Date()
            }])
            setBuddyMessage('')
        }
    }

    const availableBuddies = members?.filter(m => m._id !== currentUser._id && m.status === 'online') || []

    return (
        <div className="space-y-6">
            {/* Active Session */}
            {sessionStatus !== 'inactive' && activeBuddy ? (
                <Card className="border-2 border-primary">
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {/* Session Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {currentUser?.avatar || (currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : '??')}
                                        </div>
                                        <Users className="w-6 h-6 text-primary" />
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {activeBuddy.avatar || (activeBuddy.name ? activeBuddy.name.substring(0, 2).toUpperCase() : '??')}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Buddy Session Active</h3>
                                        <p className="text-sm text-gray-600">with {activeBuddy.name}</p>
                                    </div>
                                </div>
                                <Badge variant={sessionStatus === 'active' ? 'success' : 'secondary'} className="text-lg px-4 py-2">
                                    {sessionStatus === 'active' ? '● Live' : '⏸ Paused'}
                                </Badge>
                            </div>

                            {/* Timer */}
                            <div className="bg-gradient-to-br from-primary/10 to-purple-50 rounded-xl p-8 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Clock className="w-6 h-6 text-primary" />
                                    <span className="text-sm font-medium text-gray-700">Session Time</span>
                                </div>
                                <div className="text-5xl font-bold text-gray-900 mb-6">{formatTime(sessionTime)}</div>
                                <div className="flex items-center justify-center gap-3">
                                    <Button
                                        onClick={handleTogglePause}
                                        variant="secondary"
                                        className="flex items-center gap-2"
                                    >
                                        {sessionStatus === 'active' ? (
                                            <><Pause className="w-4 h-4" /> Pause</>
                                        ) : (
                                            <><Play className="w-4 h-4" /> Resume</>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleEndSession}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                                    >
                                        <StopCircle className="w-4 h-4" />
                                        End Session
                                    </Button>
                                </div>
                            </div>

                            {/* Buddy Chat */}
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Buddy Chat
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                                        {chatMessages.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
                                        ) : (
                                            chatMessages.map(msg => (
                                                <div key={msg.id} className={`text-sm ${msg.sender._id === currentUser._id ? 'text-right' : 'text-left'}`}>
                                                    <span className={`inline-block px-3 py-2 rounded-lg ${msg.sender._id === currentUser._id
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white border border-gray-200'
                                                        }`}>
                                                        {msg.content}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={buddyMessage}
                                            onChange={(e) => setBuddyMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Send a message to your buddy..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <Button onClick={handleSendMessage} disabled={!buddyMessage.trim()}>
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* Find Buddy */
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto">
                                👥
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Buddy Mode</h3>
                                <p className="text-gray-600">
                                    Pair with a tribe member for focused work sessions and mutual accountability
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowFindBuddy(true)}
                                size="lg"
                                className="flex items-center gap-2 mx-auto"
                            >
                                <Users className="w-5 h-5" />
                                Find a Buddy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Session History */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Session History
                    </h3>
                    {sessionHistory.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No session history yet</p>
                    ) : (
                        <div className="space-y-3">
                            {sessionHistory.map(session => (
                                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {session.buddy.avatar || (session.buddy.name ? session.buddy.name.substring(0, 2).toUpperCase() : '??')}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{session.buddy.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {session.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-900">{session.duration}m</p>
                                            <p className="text-xs text-gray-500">Duration</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-900">{session.tasksCompleted}</p>
                                            <p className="text-xs text-gray-500">Tasks</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Find Buddy Modal */}
            {showFindBuddy && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Find a Buddy</h3>
                                <button
                                    onClick={() => setShowFindBuddy(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {availableBuddies.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No online members available right now</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {availableBuddies.map(buddy => (
                                        <div
                                            key={buddy._id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {buddy.avatar || (buddy.name ? buddy.name.substring(0, 2).toUpperCase() : '??')}
                                                    </div>
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{buddy.name}</h4>
                                                    <p className="text-sm text-gray-500">{buddy.role || 'Member'}</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleStartSession(buddy)}
                                                className="flex items-center gap-2"
                                            >
                                                <Target className="w-4 h-4" />
                                                Start Session
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
