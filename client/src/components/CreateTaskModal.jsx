import { useState, useEffect } from 'react'
import { Star, Users, UserCheck, Crown, Loader2 } from 'lucide-react'
import Modal, { ModalClose } from './ui/Modal'
import { Input, Textarea, Label } from './ui/Input'
import Button from './ui/Button'
import { tribesAPI, tasksAPI } from '../services/api'

export default function CreateTaskModal({ open, onOpenChange, onCreateTask }) {
    const [tribes, setTribes] = useState([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        taskType: 'personal',
        tribe: '',
        tribeRole: '',
        isGroupTask: false,
        assignedRole: 'member', // personal, member, leader
        starred: false,
    })

    // Load tribes when modal opens
    useEffect(() => {
        if (open) {
            loadTribes()
        }
    }, [open])

    const loadTribes = async () => {
        try {
            const tribesData = await tribesAPI.getTribes()
            setTribes(tribesData)
        } catch (error) {
            console.error('Error loading tribes:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            alert('Please enter a task title')
            return
        }

        if (formData.taskType === 'tribe' && !formData.tribe) {
            alert('Please select a tribe')
            return
        }

        const selectedTribe = tribes.find(t => t.name === formData.tribe)

        const newTask = {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
            // Backend expects 'tribe' to be the ObjectId
            tribe: formData.taskType === 'tribe' ? selectedTribe?._id || selectedTribe?.id : null,
            isGroupTask: formData.taskType === 'tribe' ? formData.isGroupTask : false,
            assignedRole: formData.assignedRole,
            starred: formData.starred,
            tags: formData.isGroupTask ? ['GROUP'] : [],
        }

        try {
            setLoading(true)
            await tasksAPI.createTask(newTask)

            // Call the callback to refresh parent data
            if (onCreateTask) {
                onCreateTask()
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                taskType: 'personal',
                tribe: '',
                tribeRole: '',
                isGroupTask: false,
                assignedRole: 'member',
                starred: false,
            })

            onOpenChange(false)
        } catch (error) {
            console.error('Failed to create task:', error)
            const message = error.response?.data?.message || error.message || 'Failed to create task'
            alert(`Error: ${message}`)
        } finally {
            setLoading(false)
        }
    }

    const selectedTribe = tribes.find(t => t.name === formData.tribe)

    return (
        <Modal open={open} onOpenChange={onOpenChange} title="Create Task">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                {/* Task Title */}
                <div>
                    <Label htmlFor="title">
                        Task Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        placeholder="What needs to be done?"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1"
                        autoFocus
                        disabled={loading}
                    />
                </div>

                {/* Description */}
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Add details..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                        disabled={loading}
                    />
                </div>

                {/* Due Date and Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <Label>Priority</Label>
                        <div className="flex gap-2 mt-1">
                            {['low', 'medium', 'high'].map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority })}
                                    disabled={loading}
                                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${formData.priority === priority
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Task Type */}
                <div>
                    <Label>Task Type</Label>
                    <div className="flex gap-3 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="taskType"
                                value="personal"
                                checked={formData.taskType === 'personal'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    taskType: e.target.value,
                                    tribe: '',
                                    isGroupTask: false,
                                    assignedRole: 'personal'
                                })}
                                disabled={loading}
                                className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">Personal</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="taskType"
                                value="tribe"
                                checked={formData.taskType === 'tribe'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    taskType: e.target.value,
                                    assignedRole: 'member'
                                })}
                                disabled={loading}
                                className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">Tribe</span>
                        </label>
                    </div>
                </div>

                {/* Tribe Selection and Details (if tribe type) */}
                {formData.taskType === 'tribe' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <Label htmlFor="tribe">
                                Select Tribe <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="tribe"
                                value={formData.tribe}
                                onChange={(e) => {
                                    const selected = tribes.find(t => t.name === e.target.value)
                                    setFormData({
                                        ...formData,
                                        tribe: e.target.value,
                                        tribeRole: selected?.role || ''
                                    })
                                }}
                                disabled={loading}
                                className="mt-1 w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Choose a tribe...</option>
                                {tribes.map((tribe) => (
                                    <option key={tribe.id} value={tribe.name}>
                                        {tribe.name} ({tribe.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tribe Info Display */}
                        {selectedTribe && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Your Role:</span>
                                    <div className="flex items-center gap-1">
                                        {selectedTribe.role === 'Leader' ? (
                                            <Crown className="w-4 h-4 text-yellow-600" />
                                        ) : (
                                            <UserCheck className="w-4 h-4 text-blue-600" />
                                        )}
                                        <span className="font-medium text-gray-900">{selectedTribe.role}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Members:</span>
                                    <span className="font-medium text-gray-900">{selectedTribe.members}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Active Tasks:</span>
                                    <span className="font-medium text-gray-900">{selectedTribe.activeTasks}</span>
                                </div>
                            </div>
                        )}

                        {/* Group Task Toggle */}
                        <div className="pt-2 border-t border-gray-200">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isGroupTask}
                                    onChange={(e) => setFormData({ ...formData, isGroupTask: e.target.checked })}
                                    disabled={loading}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900">Group Task</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        This task will be shared with all tribe members
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Assignment Role */}
                        <div>
                            <Label>Task Assignment</Label>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, assignedRole: 'member' })}
                                    disabled={loading}
                                    className={`flex flex-col items-center gap-1 px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${formData.assignedRole === 'member'
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <UserCheck className="w-4 h-4" />
                                    <span>As Member</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, assignedRole: 'leader' })}
                                    disabled={loading || selectedTribe?.role !== 'Leader'}
                                    className={`flex flex-col items-center gap-1 px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${formData.assignedRole === 'leader'
                                        ? 'bg-primary text-white border-primary'
                                        : selectedTribe?.role !== 'Leader'
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Crown className="w-4 h-4" />
                                    <span>As Leader</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, assignedRole: 'delegate' })}
                                    disabled={loading || selectedTribe?.role !== 'Leader'}
                                    className={`flex flex-col items-center gap-1 px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${formData.assignedRole === 'delegate'
                                        ? 'bg-primary text-white border-primary'
                                        : selectedTribe?.role !== 'Leader'
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Delegate</span>
                                </button>
                            </div>
                            {selectedTribe?.role !== 'Leader' && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Only tribe leaders can assign tasks as leader or delegate to others
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Importance */}
                <div>
                    <Label>Importance</Label>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, starred: !formData.starred })}
                        disabled={loading}
                        className="flex items-center gap-2 mt-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 w-full"
                    >
                        <Star className={`w-4 h-4 ${formData.starred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                        <span>{formData.starred ? 'Starred' : 'Add Star'}</span>
                    </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <ModalClose asChild>
                        <Button type="button" variant="ghost" disabled={loading}>
                            Cancel
                        </Button>
                    </ModalClose>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Task'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
