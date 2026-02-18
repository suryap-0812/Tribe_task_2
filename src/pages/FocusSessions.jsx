import { useState } from 'react'
import { Target, Clock, Eye, CheckCircle2, Plus } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Textarea, Label } from '../components/ui/Input'
import Select, { SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/Select'
import Progress from '../components/ui/Progress'
import Badge from '../components/ui/Badge'
import { stats, focusSessions } from '../data/mockData'
import { formatTime, formatDate } from '../utils/helpers'

export default function FocusSessions() {
    const [selectedDuration, setSelectedDuration] = useState(25)
    const durations = [25, 45, 60, 90]

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
                                />
                                <p className="text-center text-sm text-gray-500 mt-2">or</p>
                            </div>

                            {/* Task Selection */}
                            <div>
                                <Label htmlFor="task-select" className="mb-2 block">
                                    Select a task to focus on
                                </Label>
                                <Select>
                                    <SelectTrigger id="task-select">
                                        <SelectValue placeholder="Choose a task..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="task1">Complete project proposal</SelectItem>
                                        <SelectItem value="task2">Team sync meeting prep</SelectItem>
                                        <SelectItem value="task3">Review code changes</SelectItem>
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
                                            onClick={() => setSelectedDuration(duration)}
                                            className="w-full"
                                        >
                                            {duration} min
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
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <div className="text-6xl font-bold text-gray-900 mb-2">
                                    {selectedDuration}:00
                                </div>
                                <p className="text-gray-600">Ready to start</p>
                            </div>

                            {/* Start Button */}
                            <Button className="w-full" size="lg">
                                <Plus className="w-5 h-5 mr-2" />
                                Start Focus Session
                            </Button>

                            <p className="text-center text-sm text-gray-500">
                                Please describe what you'll focus on or select a task
                            </p>
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
                                    <span className="text-sm font-semibold">{formatTime(stats.focusTime)}</span>
                                </div>
                                <Progress value={stats.focusTime} max={stats.dailyFocusGoal} />
                            </div>

                            <div className="flex items-center justify-between py-3 border-t border-gray-200">
                                <span className="text-sm text-gray-600">Sessions Completed</span>
                                <span className="text-2xl font-bold text-gray-900">{stats.sessionsCompleted}</span>
                            </div>

                            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                <span className="text-sm text-gray-600">Goal</span>
                                <span className="text-sm font-medium text-gray-900">{formatTime(stats.dailyFocusGoal)} / day</span>
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
                        {focusSessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                        <Target className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{session.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <span className="text-sm text-gray-600">{formatTime(session.duration)}</span>
                                            <span className="text-sm text-gray-400">•</span>
                                            <span className="text-sm text-gray-600">{formatDate(session.date)}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="primary">Completed</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
