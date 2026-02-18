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
]

export default function CreateTribeModal({ open, onOpenChange, onCreateTribe }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: 'blue',
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
                color: formData.color
            })

            onCreateTribe() // This will trigger reload in parent

            // Reset form
            setFormData({
                name: '',
                description: '',
                color: 'blue',
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
            <form onSubmit={handleSubmit} className="space-y-4">
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

                {/* Description */}
                <div>
                    <Label htmlFor="tribeDescription">Description</Label>
                    <Textarea
                        id="tribeDescription"
                        placeholder="What is this tribe about? What are your goals?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                        maxLength={200}
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
                </div>

                {/* Color Selection */}
                <div>
                    <Label>Tribe Color</Label>
                    <p className="text-xs text-gray-500 mb-2">Choose a color to represent your tribe</p>
                    <div className="grid grid-cols-4 gap-2">
                        {TRIBE_COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: color.value })}
                                disabled={loading}
                                className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${formData.color === color.value
                                    ? 'border-primary bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full ${color.class}`} />
                                <span className="text-sm font-medium text-gray-700">{color.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> You'll be the tribe leader and can invite members after creation.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
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
