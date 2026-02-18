import { useState, useEffect } from 'react'
import { Plus, Users, CheckCircle2, Loader2 } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import CreateTribeModal from '../components/CreateTribeModal'
import TribeDetails from '../components/TribeDetails'
import MySpace from '../components/MySpace'
import { tribesAPI } from '../services/api'

export default function MyTribes() {
    const [tribes, setTribes] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedTribe, setSelectedTribe] = useState(null)
    const [showMySpace, setShowMySpace] = useState(false)

    useEffect(() => {
        loadTribes()
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

    const handleCreateTribe = (newTribe) => {
        // Reload tribes or add to state if API returns the created object
        loadTribes()
    }

    const handleViewTribe = (tribe) => {
        setSelectedTribe(tribe)
    }

    const handleBackToTribes = () => {
        setSelectedTribe(null)
        setShowMySpace(false)
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
        return <MySpace onBack={handleBackToTribes} />
    }

    // If a tribe is selected, show the details view
    if (selectedTribe) {
        return <TribeDetails tribe={selectedTribe} onBack={handleBackToTribes} />
    }
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Tribes</h1>
                    <p className="text-gray-600 mt-1">Collaborate and stay accountable with your tribes</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Join a Tribe
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Tribe
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
                                <p className="text-lg font-semibold text-gray-900">24</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Resources</p>
                                <p className="text-lg font-semibold text-gray-900">12</p>
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

                {/* Tribe Cards */}
                {tribes.map((tribe) => (
                    <Card key={tribe.id} className="hover:shadow-lg transition-shadow">
                        <CardContent>
                            <div className="flex items-start gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tribe.color === 'blue' ? 'bg-blue-100' :
                                    tribe.color === 'purple' ? 'bg-purple-100' :
                                        'bg-green-100'
                                    }`}>
                                    <Users className={`w-6 h-6 ${tribe.color === 'blue' ? 'text-blue-600' :
                                        tribe.color === 'purple' ? 'text-purple-600' :
                                            'text-green-600'
                                        }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900">{tribe.name}</h3>
                                    <p className="text-sm text-gray-600">{tribe.description}</p>
                                </div>
                            </div>

                            {/* Active Members Indicator */}
                            <div className="flex items-center gap-1 mb-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-blue-600 font-medium">
                                    {tribe.activeToday} {tribe.activeToday === 1 ? 'member' : 'members'} active today
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-600">Members</p>
                                    <p className="text-lg font-semibold text-gray-900">{tribe.members}</p>
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
        </div>
    )
}
