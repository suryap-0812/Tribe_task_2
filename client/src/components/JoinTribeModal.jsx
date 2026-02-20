import { useState } from 'react'
import { X, Search, Users, Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import Button from './ui/Button'
import Badge from './ui/Badge'
import Card, { CardContent } from './ui/Card'
import { tribesAPI } from '../services/api'

export default function JoinTribeModal({ open, onOpenChange, onJoinRequested }) {
    const [tribeId, setTribeId] = useState('')
    const [tribe, setTribe] = useState(null)
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!tribeId.trim()) return

        try {
            setLoading(true)
            setError('')
            setTribe(null)
            const data = await tribesAPI.searchTribe(tribeId.trim())
            setTribe(data)
        } catch (error) {
            console.error('Failed to search tribe:', error)
            setError(error.response?.data?.message || 'Tribe not found. Please check the ID.')
        } finally {
            setLoading(false)
        }
    }

    const handleRequestJoin = async () => {
        try {
            setActionLoading(true)
            await tribesAPI.requestJoin(tribe._id)
            setTribe({ ...tribe, hasRequested: true })
            if (onJoinRequested) onJoinRequested()
            alert('Join request sent to tribe leader!')
        } catch (error) {
            console.error('Failed to send join request:', error)
            alert(error.response?.data?.message || 'Failed to send join request')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={(val) => {
            onOpenChange(val)
            if (!val) {
                setTribe(null)
                setTribeId('')
                setError('')
            }
        }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-primary-50/50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <Dialog.Title className="text-lg font-bold text-gray-900">Join a Tribe</Dialog.Title>
                        </div>
                        <Dialog.Close asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="p-6 space-y-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Enter Tribe Unique ID</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={tribeId}
                                        onChange={(e) => setTribeId(e.target.value)}
                                        placeholder="e.g. 64f1234567890abcdef"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm"
                                        required
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Search Tribe
                            </Button>
                        </form>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                <X className="w-4 h-4 border border-red-600 rounded-full" />
                                {error}
                            </div>
                        )}

                        {tribe && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="relative">
                                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gray-100 to-transparent rounded-t-xl -m-6 -z-10" />
                                    <Card className="overflow-hidden border-2 border-primary/10">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-lg ${tribe.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                                    tribe.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                                        tribe.color === 'green' ? 'bg-green-100 text-green-600' :
                                                            'bg-primary-100 text-primary-600'
                                                    }`}>
                                                    <Users className="w-8 h-8" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xl font-bold text-gray-900 truncate">{tribe.name}</h4>
                                                    <Badge variant="secondary" className="mt-1">
                                                        {tribe.category || 'General'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {tribe.description || 'No description provided.'}
                                                </p>

                                                <div className="flex items-center gap-4 py-3 border-y border-gray-100">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Members</p>
                                                        <p className="text-lg font-bold text-gray-900">{tribe.memberCount}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Leader</p>
                                                        <p className="text-sm font-medium text-gray-900">{tribe.createdBy?.name || 'Unknown'}</p>
                                                    </div>
                                                </div>

                                                {tribe.isMember ? (
                                                    <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                                        <ShieldCheck className="w-4 h-4" />
                                                        You are already a member
                                                    </div>
                                                ) : tribe.hasRequested ? (
                                                    <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        Join request pending approval
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={handleRequestJoin}
                                                        className="w-full h-12 text-base shadow-lg shadow-primary/20"
                                                        disabled={actionLoading}
                                                    >
                                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowRight className="w-5 h-5 mr-2" />}
                                                        Request to Join Tribe
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
