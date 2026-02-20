import { useState, useEffect } from 'react'
import { Plus, Users, CheckCircle2, Loader2 } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import CreateTribeModal from '../components/CreateTribeModal'
import JoinTribeModal from '../components/JoinTribeModal'
import TribeDetails from '../components/TribeDetails'
import MySpace from '../components/MySpace'
import { tribesAPI, tasksAPI } from '../services/api'

export default function MyTribes() {
    const [tribes, setTribes] = useState([])
    const [stats, setStats] = useState({ personalTasks: 0, personalResources: 0, personalTribeId: null })
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const [selectedTribe, setSelectedTribe] = useState(null)
    const [showMySpace, setShowMySpace] = useState(false)

    useEffect(() => {
        loadTribes()
        loadStats()
    }, [])

    const loadTribes = async () => {
        try {
            setLoading(true)
            const data = await tribesAPI.getTribes()
            setTribes(data)
        } catch (error) {
            console.error('Failed to load tribes:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const data = await tribesAPI.getTribes()
            let personalTribe = data.find(t => t.name === 'Personal Space')

            if (!personalTribe) {
                // Background create
                personalTribe = await tribesAPI.createTribe({
                    name: 'Personal Space',
                    description: 'Your personal workspace resources',
                    color: 'blue'
                })
                loadTribes() // refresh list
            }

            const tasks = await tasksAPI.getTasks({ status: 'pending' })
            const personalTasks = tasks.filter(t => !t.tribe || (personalTribe && t.tribe === personalTribe._id)).length

            setStats({
                personalTasks,
                personalResources: personalTribe.activeTasks || 0, // Abuse activeTasks for resource count in mock/display? No, use real later
                personalTribeId: personalTribe._id || personalTribe.id
            })
        } catch (error) {
            console.error('Failed to load stats:', error)
        }
    }

    const handleJoinTribe = () => {
        setIsJoinModalOpen(true)
    }

    const handleCreateTribe = (newTribe) => {
        loadTribes()
    }

    const handleViewTribe = async (tribe) => {
        try {
            setLoading(true)
            const fullTribe = await tribesAPI.getTribe(tribe._id || tribe.id)
            setSelectedTribe(fullTribe)
        } catch (error) {
            console.error('Failed to load tribe details:', error)
            alert('Failed to load tribe details')
        } finally {
            setLoading(false)
        }
    }

    const handleBackToTribes = () => {
        setSelectedTribe(null)
        setShowMySpace(false)
        loadTribes() // Refresh in case of deletion/updates
    }

    const handleViewMySpace = () => {
        setShowMySpace(true)
    }

    // If showing spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // If My Space is selected, show the My Space view
    if (showMySpace) {
        return (
            <MySpace
                onBack={handleBackToTribes}
                tribeId={stats.personalTribeId}
            />
        )
    }

    // If a tribe is selected, show the details view
    if (selectedTribe) {
        return <TribeDetails tribe={selectedTribe} onBack={handleBackToTribes} />
    }
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tribes</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Collaborate and stay accountable with your tribes</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button variant="outline" size="sm" onClick={handleJoinTribe} className="flex-1 sm:flex-none">
                        <Users className="w-4 h-4 mr-1.5 sm:mr-2" />
                        Join <span className="hidden xs:inline">a Tribe</span>
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="flex-1 sm:flex-none">
                        <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
                        Create <span className="hidden xs:inline">New Tribe</span>
                    </Button>
                </div>
            </div>

            {/* Tribes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* My Space Card - Personal Workspace */}
                <Card className="border-2 border-primary hover:shadow-xl transition-all bg-gradient-to-br from-primary-50 to-white">
                    <CardContent>
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    My Space
                                    <Badge variant="primary" className="text-xs">Personal</Badge>
                                </h3>
                                <p className="text-sm text-gray-600">Your personal workspace</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4 px-3 py-2 bg-white/70 rounded-lg border border-primary-100">
                            <p className="text-xs text-gray-600">
                                Manage your personal tasks, resources, and track your individual progress
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-primary-100">
                            <div>
                                <p className="text-sm text-gray-600">My Tasks</p>
                                <p className="text-lg font-semibold text-gray-900">{stats.personalTasks}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Resources</p>
                                <p className="text-lg font-semibold text-gray-900">{stats.personalResources}</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-2">
                            <Button
                                variant="primary"
                                size="sm"
                                className="w-full"
                                onClick={() => window.location.href = '/pending-tasks'}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                View My Tasks
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={handleViewMySpace}
                            >
                                Manage Resources
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tribe Cards - Filter out the hardcoded "Personal Space" which is now "My Space" */}
                {tribes.filter(t => t.name !== 'Personal Space').map((tribe) => (
                    <Card key={tribe.id} className="hover:shadow-lg transition-shadow">
                        <CardContent>
                            <div className="flex items-start gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tribe.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                    tribe.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                        tribe.color === 'green' ? 'bg-green-100 text-green-600' :
                                            tribe.color === 'red' ? 'bg-red-100 text-red-600' :
                                                tribe.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                                    tribe.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                                                        tribe.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                                                            tribe.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                                                                'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 truncate">{tribe.name}</h3>
                                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-gray-100 text-gray-600 border-none">
                                            {tribe.category || 'General'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{tribe.description}</p>
                                </div>
                            </div>

                            {/* Active Members Indicator */}
                            <div className="flex items-center gap-1 mb-4">
                                <div className={`w-2 h-2 rounded-full ${(tribe.activeToday || 0) > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className={`text-sm font-medium ${(tribe.activeToday || 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                    {(tribe.activeToday || 0)} members active today
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-600">Members</p>
                                    <p className="text-lg font-semibold text-gray-900">{tribe.memberCount || tribe.members}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Tasks</p>
                                    <p className="text-lg font-semibold text-gray-900">{tribe.activeTasks}</p>
                                </div>
                            </div>

                            {/* Role & Action */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Your Role:</p>
                                    <Badge variant={tribe.role === 'Leader' ? 'primary' : 'default'} className="mt-1">
                                        {tribe.role}
                                    </Badge>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleViewTribe(tribe)}>
                                    View Tribe
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Create New Tribe Card */}
                <Card className="border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary-50/50 transition-all cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Tribe</h3>
                            <p className="text-gray-600 mb-4">Start a new accountability group</p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Tribe
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Tribe Modal */}
            <CreateTribeModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreateTribe={handleCreateTribe}
            />

            <JoinTribeModal
                open={isJoinModalOpen}
                onOpenChange={setIsJoinModalOpen}
                onJoinRequested={() => {
                    // Could refresh something, but request is pending
                }}
            />
        </div >
    )
}
