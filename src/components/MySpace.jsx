import { useState } from 'react'
import { ArrowLeft, Upload, Plus, FileText, Image, Link as LinkIcon, Code, Calendar, Search, Filter, Download, Trash2, Edit } from 'lucide-react'
import Card, { CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import * as Tabs from '@radix-ui/react-tabs'

export default function MySpace({ onBack }) {
    const [activeTab, setActiveTab] = useState('resources')
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showNoteModal, setShowNoteModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')

    // Mock data - In real app, this would come from API
    const [resources, setResources] = useState([
        { id: 1, name: 'Project Requirements.pdf', type: 'document', url: '#', size: '2.4 MB', category: 'Documentation', uploadedAt: new Date(Date.now() - 86400000) },
        { id: 2, name: 'Design Mockups.png', type: 'image', url: '#', size: '1.8 MB', category: 'Design', uploadedAt: new Date(Date.now() - 172800000) },
        { id: 3, name: 'API Documentation', type: 'link', url: 'https://api.example.com', category: 'Development', uploadedAt: new Date(Date.now() - 259200000) },
        { id: 4, name: 'Helper Functions', type: 'code', url: '#', size: '45 KB', category: 'Code', uploadedAt: new Date(Date.now() - 345600000) },
    ])

    const [notes, setNotes] = useState([
        { id: 1, title: 'Meeting Notes - Jan 15', content: 'Discussed project timeline and deliverables...', createdAt: new Date(Date.now() - 86400000), tags: ['meeting', 'important'] },
        { id: 2, title: 'Ideas for Q2', content: 'Brainstorming new features and improvements...', createdAt: new Date(Date.now() - 172800000), tags: ['ideas', 'planning'] },
        { id: 3, title: 'Technical Debt Items', content: 'List of technical debt to address...', createdAt: new Date(Date.now() - 259200000), tags: ['technical', 'todo'] },
    ])

    const [newResource, setNewResource] = useState({
        name: '',
        type: 'document',
        url: '',
        category: '',
        file: null
    })

    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        tags: []
    })

    const handleUploadResource = () => {
        if (newResource.name && (newResource.url || newResource.file)) {
            const resource = {
                id: resources.length + 1,
                name: newResource.name,
                type: newResource.type,
                url: newResource.url || URL.createObjectURL(newResource.file),
                size: newResource.file ? `${(newResource.file.size / 1024).toFixed(1)} KB` : 'N/A',
                category: newResource.category || 'Uncategorized',
                uploadedAt: new Date()
            }
            setResources([resource, ...resources])
            setNewResource({ name: '', type: 'document', url: '', category: '', file: null })
            setShowUploadModal(false)
        }
    }

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

    const handleDeleteResource = (id) => {
        setResources(resources.filter(r => r.id !== id))
    }

    const handleDeleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id))
    }

    const getResourceIcon = (type) => {
        switch (type) {
            case 'document': return <FileText className="w-5 h-5" />
            case 'image': return <Image className="w-5 h-5" />
            case 'link': return <LinkIcon className="w-5 h-5" />
            case 'code': return <Code className="w-5 h-5" />
            default: return <FileText className="w-5 h-5" />
        }
    }

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || resource.type === filterType
        return matchesSearch && matchesType
    })

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
                            📚 Resources ({resources.length})
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
                    <div className="space-y-4">
                        {/* Actions Bar */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search resources..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">All Types</option>
                                    <option value="document">Documents</option>
                                    <option value="image">Images</option>
                                    <option value="link">Links</option>
                                    <option value="code">Code</option>
                                </select>
                            </div>
                            <Button onClick={() => setShowUploadModal(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Resource
                            </Button>
                        </div>

                        {/* Resources Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredResources.map((resource) => (
                                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resource.type === 'document' ? 'bg-blue-100 text-blue-600' :
                                                    resource.type === 'image' ? 'bg-green-100 text-green-600' :
                                                        resource.type === 'link' ? 'bg-purple-100 text-purple-600' :
                                                            'bg-orange-100 text-orange-600'
                                                }`}>
                                                {getResourceIcon(resource.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{resource.name}</h4>
                                                <Badge variant="secondary" className="text-xs mt-1">
                                                    {resource.type}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{resource.category}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>{resource.size}</span>
                                            <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Download className="w-3 h-3 mr-1" />
                                                Download
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteResource(resource.id)}
                                            >
                                                <Trash2 className="w-3 h-3 text-red-600" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredResources.length === 0 && (
                            <div className="text-center py-12">
                                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No resources found</p>
                                <Button onClick={() => setShowUploadModal(true)} className="mt-4">
                                    Upload Your First Resource
                                </Button>
                            </div>
                        )}
                    </div>
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

            {/* Upload Resource Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Resource</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newResource.name}
                                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Resource name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={newResource.type}
                                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="document">Document</option>
                                        <option value="image">Image</option>
                                        <option value="link">Link</option>
                                        <option value="code">Code</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={newResource.category}
                                        onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g., Documentation, Design"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {newResource.type === 'link' ? 'URL' : 'File'}
                                    </label>
                                    {newResource.type === 'link' ? (
                                        <input
                                            type="url"
                                            value={newResource.url}
                                            onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="https://example.com"
                                        />
                                    ) : (
                                        <input
                                            type="file"
                                            onChange={(e) => setNewResource({ ...newResource, file: e.target.files[0] })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-6">
                                <Button onClick={handleUploadResource} className="flex-1">
                                    Upload
                                </Button>
                                <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

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
