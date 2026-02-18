import { useState } from 'react'
import { ArrowLeft, Upload, Plus, FileText, Image, Link as LinkIcon, Code, Calendar, Search, Filter, Download, Trash2, Edit } from 'lucide-react'
import Card, { CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import * as Tabs from '@radix-ui/react-tabs'
import ResourceLibrary from './ResourceLibrary'

export default function MySpace({ onBack, tribeId }) {
    const [activeTab, setActiveTab] = useState('resources')
    const [showNoteModal, setShowNoteModal] = useState(false)

    // Mock data for Notes (Persistence not yet implemented in backend)
    const [notes, setNotes] = useState([
        { id: 1, title: 'Meeting Notes - Jan 15', content: 'Discussed project timeline and deliverables...', createdAt: new Date(Date.now() - 86400000), tags: ['meeting', 'important'] },
    ])

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        tags: []
    })

    const handleCreateNote = () => {
        if (newNote.title && newNote.content) {
            const note = {
                id: notes.length + 1,
                title: newNote.title,
                content: newNote.content,
                tags: newNote.tags,
                createdAt: new Date()
            }
            setNotes([note, ...notes])
            setNewNote({ title: '', content: '', tags: [] })
            setShowNoteModal(false)
        }
    }

    const handleDeleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Tribes</span>
                    </button>
                </div>
            </div>

            {/* Space Info */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                        MS
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Space</h1>
                        <p className="text-gray-600">Your personal workspace</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex gap-4 border-b border-gray-200">
                    <Tabs.Trigger
                        value="resources"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary">
                        <div className="flex items-center gap-2">
                            📚 Resources
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="notes"
                        className="pb-3 px-1 text-sm font-medium transition-colors relative data-[state=active]:text-primary data-[state=inactive]:text-gray-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary">
                        <div className="flex items-center gap-2">
                            📝 Notes ({notes.length})
                        </div>
                    </Tabs.Trigger>
                </Tabs.List>

                {/* Resources Tab */}
                <Tabs.Content value="resources" className="mt-6">
                    <ResourceLibrary tribeId={tribeId} currentUser={currentUser} />
                </Tabs.Content>

                {/* Notes Tab */}
                <Tabs.Content value="notes" className="mt-6">
                    <div className="space-y-4">
                        {/* Actions Bar */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">My Notes</h2>
                            <Button onClick={() => setShowNoteModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Note
                            </Button>
                        </div>

                        {/* Notes List */}
                        <div className="space-y-3">
                            {notes.map((note) => (
                                <Card key={note.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900">{note.title}</h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteNote(note.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{note.content}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {note.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {notes.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No notes yet</p>
                                <Button onClick={() => setShowNoteModal(true)} className="mt-4">
                                    Create Your First Note
                                </Button>
                            </div>
                        )}
                    </div>
                </Tabs.Content>
            </Tabs.Root>

            {/* Create Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Note</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newNote.title}
                                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Note title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        value={newNote.content}
                                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                        rows={8}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                        placeholder="Write your note here..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        onChange={(e) => setNewNote({ ...newNote, tags: e.target.value.split(',').map(t => t.trim()) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g., meeting, important, todo"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-6">
                                <Button onClick={handleCreateNote} className="flex-1">
                                    Create Note
                                </Button>
                                <Button variant="outline" onClick={() => setShowNoteModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
