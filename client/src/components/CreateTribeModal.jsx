import { useState } from 'react'
import Modal, { ModalClose } from './ui/Modal'
import { Input, Textarea, Label } from './ui/Input'
import Button from './ui/Button'
import { tribesAPI } from '../services/api'
import { Loader2 } from 'lucide-react'

const TRIBE_COLORS = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
]

export default function CreateTribeModal({ open, onOpenChange, onCreateTribe }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: 'blue',
        category: 'General',
        isPrivate: false,
        rules: '',
        goals: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            alert('Please enter a tribe name')
            return
        }

        try {
            setLoading(true)
            await tribesAPI.createTribe({
                name: formData.name,
                description: formData.description,
                color: formData.color,
                category: formData.category,
                isPrivate: formData.isPrivate,
                rules: formData.rules.split('\n').filter(r => r.trim()),
                goals: formData.goals.split('\n').filter(g => g.trim()),
            })

            onCreateTribe() // This will trigger reload in parent

            // Reset form
            setFormData({
                name: '',
                description: '',
                color: 'blue',
                category: 'General',
                isPrivate: false,
                rules: '',
                goals: '',
            })
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to create tribe:', error)
            alert('Failed to create tribe. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal open={open} onOpenChange={onOpenChange} title="Create New Tribe">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                {/* Tribe Name */}
                <div>
                    <Label htmlFor="tribeName">
                        Tribe Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="tribeName"
                        placeholder="e.g., Study Group, Work Team, Fitness Squad"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1"
                        autoFocus
                        maxLength={50}
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.name.length}/50 characters</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                        <Label htmlFor="tribeCategory">Category</Label>
                        <select
                            id="tribeCategory"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            disabled={loading}
                            className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        >
                            {['Coding', 'Fitness', 'Study', 'Health', 'General', 'Design', 'Business', 'Other'].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Privacy */}
                    <div>
                        <Label>Privacy</Label>
                        <div className="flex items-center gap-4 mt-2 h-9">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="privacy"
                                    checked={!formData.isPrivate}
                                    onChange={() => setFormData({ ...formData, isPrivate: false })}
                                    disabled={loading}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm">Public</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="privacy"
                                    checked={formData.isPrivate}
                                    onChange={() => setFormData({ ...formData, isPrivate: true })}
                                    disabled={loading}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm">Private</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <Label htmlFor="tribeDescription">Description</Label>
                    <Textarea
                        id="tribeDescription"
                        placeholder="What is this tribe about? What are your goals?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1"
                        rows={2}
                        maxLength={200}
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
                </div>

                {/* Rules & Goals */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="tribeRules">Rules (one per line)</Label>
                        <Textarea
                            id="tribeRules"
                            placeholder="Be respectful&#10;Daily updates"
                            value={formData.rules}
                            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                            className="mt-1 text-sm"
                            rows={3}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <Label htmlFor="tribeGoals">Goals (one per line)</Label>
                        <Textarea
                            id="tribeGoals"
                            placeholder="Launch MVP&#10;Lose 5kg"
                            value={formData.goals}
                            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                            className="mt-1 text-sm"
                            rows={3}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Color Selection */}
                <div>
                    <Label>Tribe Color</Label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                        {TRIBE_COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: color.value })}
                                disabled={loading}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${formData.color === color.value
                                    ? 'border-primary bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full ${color.class}`} />
                                <span className="text-[10px] font-medium text-gray-600">{color.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                        💡 <strong>Tip:</strong> New members will see these rules and goals when they join.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                            'Create Tribe'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
