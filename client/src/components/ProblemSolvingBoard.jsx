import { useState } from 'react'
import { Plus, ThumbsUp, MessageSquare, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Card, { CardContent } from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'

export default function ProblemSolvingBoard({ tribeId, problems: initialProblems, currentUser, onCreateProblem, onAddSolution, onVote }) {
    const [problems, setProblems] = useState(initialProblems || [])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedProblem, setSelectedProblem] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')

    const [newProblem, setNewProblem] = useState({
        title: '',
        description: '',
        category: 'general'
    })

    const [newSolution, setNewSolution] = useState('')

    const categories = ['all', 'technical', 'design', 'process', 'general']
    const statuses = ['all', 'open', 'discussing', 'resolved']

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open':
                return <AlertCircle className="w-4 h-4 text-blue-500" />
            case 'discussing':
                return <Clock className="w-4 h-4 text-yellow-500" />
            case 'resolved':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            default:
                return null
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'discussing':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'resolved':
                return 'bg-green-100 text-green-700 border-green-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const filteredProblems = problems.filter(problem => {
        const statusMatch = filterStatus === 'all' || problem.status === filterStatus
        const categoryMatch = filterCategory === 'all' || problem.category === filterCategory
        return statusMatch && categoryMatch
    })

    const groupedProblems = {
        open: filteredProblems.filter(p => p.status === 'open'),
        discussing: filteredProblems.filter(p => p.status === 'discussing'),
        resolved: filteredProblems.filter(p => p.status === 'resolved')
    }

    const handleCreateProblem = () => {
        if (newProblem.title.trim()) {
            const problem = {
                id: Date.now(),
                ...newProblem,
                creator: currentUser,
                status: 'open',
                solutions: [],
                createdAt: new Date(),
                votes: 0
            }

            setProblems([problem, ...problems])
            setNewProblem({ title: '', description: '', category: 'general' })
            setShowCreateModal(false)

            if (onCreateProblem) {
                onCreateProblem(problem)
            }
        }
    }

    const handleAddSolution = (problemId) => {
        if (newSolution.trim()) {
            const updatedProblems = problems.map(problem => {
                if (problem.id === problemId) {
                    const solution = {
                        id: Date.now(),
                        author: currentUser,
                        content: newSolution,
                        votes: 0,
                        timestamp: new Date()
                    }
                    return {
                        ...problem,
                        solutions: [...problem.solutions, solution],
                        status: problem.status === 'open' ? 'discussing' : problem.status
                    }
                }
                return problem
            })

            setProblems(updatedProblems)
            setNewSolution('')

            if (onAddSolution) {
                onAddSolution(problemId, newSolution)
            }
        }
    }

    const handleVote = (problemId, solutionId) => {
        const updatedProblems = problems.map(problem => {
            if (problem.id === problemId) {
                return {
                    ...problem,
                    solutions: problem.solutions.map(solution =>
                        solution.id === solutionId
                            ? { ...solution, votes: solution.votes + 1 }
                            : solution
                    )
                }
            }
            return problem
        })

        setProblems(updatedProblems)

        if (onVote) {
            onVote(problemId, solutionId)
        }
    }

    const handleMarkResolved = (problemId) => {
        const updatedProblems = problems.map(problem =>
            problem.id === problemId ? { ...problem, status: 'resolved' } : problem
        )
        setProblems(updatedProblems)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Problem Solving Board</h3>
                    <p className="text-sm text-gray-600 mt-1">Collaborate to solve challenges</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Problem
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Category:</span>
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterCategory === cat
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['open', 'discussing', 'resolved'].map(status => (
                    <div key={status} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status)}
                                <h4 className="font-semibold text-gray-900 capitalize">{status}</h4>
                                <Badge variant="secondary" className="text-xs">
                                    {groupedProblems[status].length}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-3 min-h-[400px]">
                            {groupedProblems[status].map(problem => (
                                <Card
                                    key={problem.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => setSelectedProblem(problem)}
                                >
                                    <CardContent className="pt-4">
                                        <div className="space-y-3">
                                            <div>
                                                <h5 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                                    {problem.title}
                                                </h5>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {problem.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="secondary" className="text-xs">
                                                    {problem.category}
                                                </Badge>
                                                <Badge variant={status === 'resolved' ? 'success' : 'default'} className={`text-xs border ${getStatusColor(status)}`}>
                                                    {status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                        {problem.creator.avatar || problem.creator.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span>{problem.creator.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        {problem.solutions.length}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ThumbsUp className="w-3 h-3" />
                                                        {problem.solutions.reduce((sum, s) => sum + s.votes, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {groupedProblems[status].length === 0 && (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                                    <p className="text-sm text-gray-500">No {status} problems</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Problem Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Problem</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Problem Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={newProblem.title}
                                        onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                                        placeholder="What's the challenge?"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newProblem.description}
                                        onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                                        placeholder="Provide more details..."
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={newProblem.category}
                                        onChange={(e) => setNewProblem({ ...newProblem, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {categories.filter(c => c !== 'all').map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowCreateModal(false)
                                            setNewProblem({ title: '', description: '', category: 'general' })
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateProblem} disabled={!newProblem.title.trim()}>
                                        Create Problem
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Problem Detail Modal */}
            {selectedProblem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="secondary">{selectedProblem.category}</Badge>
                                        <Badge className={`border ${getStatusColor(selectedProblem.status)}`}>
                                            {selectedProblem.status}
                                        </Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProblem.title}</h3>
                                    <p className="text-gray-600">{selectedProblem.description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedProblem(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {selectedProblem.creator.avatar || selectedProblem.creator.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span>Posted by <strong>{selectedProblem.creator.name}</strong></span>
                                <span>•</span>
                                <span>{new Date(selectedProblem.createdAt).toLocaleDateString()}</span>
                            </div>

                            {/* Solutions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900">
                                        Solutions ({selectedProblem.solutions.length})
                                    </h4>
                                    {selectedProblem.status !== 'resolved' && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleMarkResolved(selectedProblem.id)}
                                        >
                                            Mark as Resolved
                                        </Button>
                                    )}
                                </div>

                                {selectedProblem.solutions
                                    .sort((a, b) => b.votes - a.votes)
                                    .map(solution => (
                                        <div key={solution.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleVote(selectedProblem.id, solution.id)}
                                                    className="flex flex-col items-center gap-1 px-2"
                                                >
                                                    <ThumbsUp className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
                                                    <span className="text-sm font-semibold text-gray-700">{solution.votes}</span>
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                            {solution.author.avatar || solution.author.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{solution.author.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(solution.timestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{solution.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                {/* Add Solution */}
                                <div className="pt-4 border-t border-gray-200">
                                    <textarea
                                        value={newSolution}
                                        onChange={(e) => setNewSolution(e.target.value)}
                                        placeholder="Share your solution..."
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            onClick={() => handleAddSolution(selectedProblem.id)}
                                            disabled={!newSolution.trim()}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Add Solution
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
