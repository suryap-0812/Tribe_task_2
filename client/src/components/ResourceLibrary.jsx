import { useState, useEffect } from 'react'
import { Upload, Search, Filter, FileText, Image, Link, Code, Download, Trash2, Loader2 } from 'lucide-react'
import Card, { CardContent } from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { tribesAPI } from '../services/api'

export default function ResourceLibrary({ tribeId, currentUser }) {
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [newResource, setNewResource] = useState({
        name: '',
        type: 'document',
        url: '',
        category: '',
        description: ''
    })

    useEffect(() => {
        if (tribeId) {
            loadResources()
        }
    }, [tribeId])

    const loadResources = async () => {
        try {
            setLoading(true)
            const data = await tribesAPI.getResources(tribeId)
            setResources(data.resources || [])
        } catch (error) {
            console.error('Failed to load resources:', error)
        } finally {
            setLoading(false)
        }
    }

    const resourceTypes = ['all', 'document', 'image', 'link', 'code']

    const getTypeIcon = (type) => {
        switch (type) {
            case 'document':
                return <FileText className="w-5 h-5 text-blue-500" />
            case 'image':
                return <Image className="w-5 h-5 text-green-500" />
            case 'link':
                return <Link className="w-5 h-5 text-purple-500" />
            case 'code':
                return <Code className="w-5 h-5 text-orange-500" />
            default:
                return <FileText className="w-5 h-5 text-gray-500" />
        }
    }

    const getTypeColor = (type) => {
        switch (type) {
            case 'document':
                return 'bg-blue-100 text-blue-700 border-blue-300'
            case 'image':
                return 'bg-green-100 text-green-700 border-green-300'
            case 'link':
                return 'bg-purple-100 text-purple-700 border-purple-300'
            case 'code':
                return 'bg-orange-100 text-orange-700 border-orange-300'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300'
        }
    }

    const filteredResources = resources.filter(resource => {
        const typeMatch = filterType === 'all' || resource.type === filterType
        const searchMatch = searchQuery === '' ||
            resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (resource.category && resource.category.toLowerCase().includes(searchQuery.toLowerCase()))
        return typeMatch && searchMatch
    })

    const handleUploadResource = async () => {
        if (newResource.name.trim()) {
            try {
                const response = await tribesAPI.uploadResource(tribeId, {
                    ...newResource,
                    uploader: currentUser._id,
                    size: '1.2 MB' // This would ideally be calculated server-side or during file upload
                })

                setResources([response.resource, ...resources])
                setNewResource({ name: '', type: 'document', url: '', category: '', description: '' })
                setShowUploadModal(false)
            } catch (error) {
                console.error('Failed to upload resource:', error)
                alert('Failed to upload resource')
            }
        }
    }

    const handleDeleteResource = async (resourceId) => {
        if (window.confirm('Delete this resource?')) {
            try {
                await tribesAPI.deleteResource(tribeId, resourceId)
                setResources(resources.filter(r => r._id !== resourceId && r.id !== resourceId))
            } catch (error) {
                console.error('Failed to delete resource:', error)
                alert('Failed to delete resource')
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Resource Library</h3>
                    <p className="text-sm text-gray-600 mt-1">{resources.length} shared resources</p>
                </div>
                <Button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Upload Resource
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">

                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <div className="flex gap-2">
                        {resourceTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-2 text-sm rounded-lg transition-colors capitalize ${filterType === type
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Resources Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredResources.length === 0 ? (
                <Card className="py-16">
                    <div className="text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.map(resource => (
                        <Card key={resource._id || resource.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                                {getTypeIcon(resource.type)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 line-clamp-1">{resource.name}</h4>
                                                <Badge className={`text-xs border mt-1 ${getTypeColor(resource.type)}`}>
                                                    {resource.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>

                                    {/* Category */}
                                    {resource.category && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {resource.category}
                                            </Badge>
                                            {resource.size && (
                                                <span className="text-xs text-gray-500">{resource.size}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                {resource.uploader?.avatar || resource.uploader?.name?.[0] || 'U'}
                                            </div>
                                            <span>{new Date(resource.createdAt || resource.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {resource.type === 'link' ? (
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    <Link className="w-4 h-4" />
                                                </a>
                                            ) : (
                                                <button className="text-primary hover:text-primary/80 transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                            {(resource.uploader?._id === currentUser?._id || resource.uploader === currentUser?._id) && (
                                                <button
                                                    onClick={() => handleDeleteResource(resource._id || resource.id)}
                                                    className="text-red-600 hover:text-red-700 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Resource</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resource Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newResource.name}
                                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                        placeholder="e.g., Project Setup Guide"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={newResource.type}
                                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {resourceTypes.filter(t => t !== 'all').map(type => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {newResource.type === 'link' ? 'URL *' : 'File URL'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newResource.url}
                                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                                        placeholder={newResource.type === 'link' ? 'https://...' : 'File path or URL'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={newResource.category}
                                        onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                                        placeholder="e.g., Documentation, Design, Code"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newResource.description}
                                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                                        placeholder="Brief description..."
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowUploadModal(false)
                                            setNewResource({ name: '', type: 'document', url: '', category: '', description: '' })
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUploadResource} disabled={!newResource.name.trim()}>
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
