import { useState, useEffect, useRef, useCallback } from 'react'
import { Target, Clock, Eye, CheckCircle2, Plus, Pause, Play, Square, Loader2 } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Textarea, Label } from '../components/ui/Input'
import Select, { SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/Select'
import Progress from '../components/ui/Progress'
import Badge from '../components/ui/Badge'
import { tasksAPI, focusSessionsAPI, statsAPI } from '../services/api'
import { formatTime, formatDate } from '../utils/helpers'

export default function FocusSessions() {
    const [selectedDuration, setSelectedDuration] = useState(25)
    const [tasks, setTasks] = useState([])
    const [history, setHistory] = useState([])
    const [statsData, setStatsData] = useState({
        focusTime: 0,
        sessionsCompleted: 0,
        dailyFocusGoal: 180
    })
    const [loading, setLoading] = useState(true)
    const [activeSession, setActiveSession] = useState(null)
    const [intent, setIntent] = useState('')
    const [selectedTaskId, setSelectedTaskId] = useState('none')

    const [timer, setTimer] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const timerRef = useRef(null)

    const durations = [25, 45, 60, 90]

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [statsRes, tasksRes, historyRes] = await Promise.all([
                statsAPI.getDashboardStats(),
                tasksAPI.getTasks({ status: 'pending' }),
                focusSessionsAPI.getFocusSessions({ limit: 5 })
            ])
            setStatsData({
                focusTime: statsRes.focusTime || 0,
                sessionsCompleted: statsRes.sessionsCompleted || 0,
                dailyFocusGoal: statsRes.dailyFocusGoal || 180
            })
            setTasks(Array.isArray(tasksRes) ? tasksRes : [])
            setHistory(Array.isArray(historyRes) ? historyRes : [])
        } catch (error) {
            console.error('Failed to fetch focus data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        if (isActive && !isPaused && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        } else if (timer === 0) {
            handleStopSession()
        }
        return () => clearInterval(timerRef.current)
    }, [isActive, isPaused, timer])

    const handleStartSession = async () => {
        if (!intent && selectedTaskId === 'none') {
            alert('Please describe your focus or select a task')
            return
        }

        try {
            const task = tasks.find(t => t._id === selectedTaskId)
            const sessionData = {
                title: intent || (task ? task.title : 'Focus Session'),
                plannedDuration: selectedDuration,
                task: selectedTaskId === 'none' ? null : selectedTaskId,
                tribe: task?.tribe?._id || task?.tribe || null
            }

            const res = await focusSessionsAPI.createFocusSession(sessionData)
            setActiveSession(res)
            setTimer(selectedDuration * 60)
            setIsActive(true)
            setIsPaused(false)
        } catch (error) {
            console.error('Failed to start session:', error)
            alert('Could not start session. Please try again.')
        }
    }

    const handlePauseSession = () => {
        setIsPaused(!isPaused)
    }

    const handleStopSession = async () => {
        if (!activeSession) return

        clearInterval(timerRef.current)
        try {
            // Actual duration in minutes
            const actualDuration = Math.round((selectedDuration * 60 - timer) / 60)
            await focusSessionsAPI.completeFocusSession(activeSession._id, {
                duration: Math.max(1, actualDuration)
            })

            // Success cleanup
            setIsActive(false)
            setIsPaused(false)
            setActiveSession(null)
            setIntent('')
            setSelectedTaskId('none')
            setTimer(selectedDuration * 60)
            fetchData() // Refresh stats and history
        } catch (error) {
            console.error('Failed to complete session:', error)
            setIsActive(false)
            setActiveSession(null)
        }
    }

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    if (loading && !isActive) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading your focus environment...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Focus Sessions</h1>
                <p className="text-gray-600 mt-1">Track your focused work time and stay productive</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* New Focus Session */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>New Focus Session</CardTitle>
                                    <p className="text-sm text-gray-600">Set a timer and eliminate distractions</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Focus Intent */}
                            <div>
                                <Label htmlFor="focus-intent" className="mb-2 block">
                                    What will you focus on? <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="focus-intent"
                                    placeholder="Describe your focus intent..."
                                    rows={3}
                                    value={intent}
                                    onChange={(e) => setIntent(e.target.value)}
                                    disabled={isActive}
                                />
                                <p className="text-center text-sm text-gray-500 mt-2">or</p>
                            </div>

                            {/* Task Selection */}
                            <div>
                                <Label htmlFor="task-select" className="mb-2 block">
                                    Select a task to focus on
                                </Label>
                                <Select
                                    value={selectedTaskId}
                                    onValueChange={setSelectedTaskId}
                                    disabled={isActive}
                                >
                                    <SelectTrigger id="task-select">
                                        <SelectValue placeholder="Choose a task..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Choose a task...</SelectItem>
                                        {tasks.map(task => (
                                            <SelectItem key={task._id} value={task._id}>{task.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration */}
                            <div>
                                <Label className="mb-3 block">Duration</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {durations.map((duration) => (
                                        <Button
                                            key={duration}
                                            variant={selectedDuration === duration ? 'primary' : 'outline'}
                                            onClick={() => {
                                                setSelectedDuration(duration)
                                                if (!isActive) setTimer(duration * 60)
                                            }}
                                            className="w-full h-10 px-0 sm:px-4"
                                            disabled={isActive}
                                        >
                                            {duration}m
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Tribe Visibility */}
                            <div className="flex items-center gap-2 text-sm text-primary bg-primary-50 p-3 rounded-lg">
                                <Eye className="w-4 h-4" />
                                <span>Your tribe can see when you're focusing</span>
                            </div>

                            {/* Timer Display */}
                            <div className={`rounded-xl p-8 text-center transition-colors ${isActive ? 'bg-primary-50' : 'bg-gray-50'}`}>
                                <div className={`text-6xl font-bold mb-2 tabular-nums ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                                    {formatTimer(timer)}
                                </div>
                                <p className="text-gray-600">
                                    {isActive ? (isPaused ? 'Paused' : 'Session in progress') : 'Ready to start'}
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex gap-3">
                                {!isActive ? (
                                    <Button className="w-full" size="lg" onClick={handleStartSession}>
                                        <Play className="w-5 h-5 mr-2" />
                                        Start Focus Session
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            size="lg"
                                            onClick={handlePauseSession}
                                        >
                                            {isPaused ? (
                                                <><Play className="w-5 h-5 mr-2" /> Resume</>
                                            ) : (
                                                <><Pause className="w-5 h-5 mr-2" /> Pause</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            size="lg"
                                            onClick={handleStopSession}
                                        >
                                            <Square className="w-5 h-5 mr-2" /> Stop
                                        </Button>
                                    </>
                                )}
                            </div>

                            {!isActive && (
                                <p className="text-center text-sm text-gray-500">
                                    Please describe what you'll focus on or select a task
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Today's Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Focus Time</span>
                                    <span className="text-sm font-semibold">{formatTime(statsData.focusTime)}</span>
                                </div>
                                <Progress value={statsData.focusTime} max={statsData.dailyFocusGoal} />
                            </div>

                            <div className="flex items-center justify-between py-3 border-t border-gray-200">
                                <span className="text-sm text-gray-600">Sessions Completed</span>
                                <span className="text-2xl font-bold text-gray-900">{statsData.sessionsCompleted}</span>
                            </div>

                            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                <span className="text-sm text-gray-600">Goal</span>
                                <span className="text-sm font-medium text-gray-900">{formatTime(statsData.dailyFocusGoal)} / day</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Focus Tips */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-900">Focus Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Remove distractions</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Take regular breaks</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Stay hydrated</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {history.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                No recent sessions found
                            </div>
                        ) : (
                            history.map((session) => (
                                <div
                                    key={session._id}
                                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                            <Target className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 line-clamp-1">{session.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-600">{formatTime(session.duration || session.plannedDuration)}</span>
                                                <span className="text-sm text-gray-400">•</span>
                                                <span className="text-sm text-gray-600">{formatDate(session.startedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={session.status === 'completed' ? 'primary' : 'outline'}>
                                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
