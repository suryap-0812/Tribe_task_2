import { useState } from 'react'
import { Trophy, Lock, Star } from 'lucide-react'
import Card, { CardContent } from './ui/Card'
import Badge from './ui/Badge'

export default function Achievements({ tribeId, userAchievements = [] }) {
    const [filter, setFilter] = useState('all') // all, unlocked, locked

    const achievements = [
        {
            id: 1,
            name: 'First Steps',
            description: 'Complete your first task',
            icon: '🎯',
            rarity: 'common',
            unlocked: true,
            unlockedDate: new Date(Date.now() - 7 * 86400000),
            progress: 100,
            criteria: 'Complete 1 task'
        },
        {
            id: 2,
            name: 'Task Master',
            description: 'Complete 50 tasks',
            icon: '📋',
            rarity: 'rare',
            unlocked: true,
            unlockedDate: new Date(Date.now() - 3 * 86400000),
            progress: 100,
            criteria: 'Complete 50 tasks'
        },
        {
            id: 3,
            name: 'Focus Champion',
            description: 'Accumulate 100 hours of focus time',
            icon: '⏱️',
            rarity: 'epic',
            unlocked: false,
            progress: 67,
            criteria: 'Complete 6000 minutes of focus time (currently 4020/6000)'
        },
        {
            id: 4,
            name: 'Streak Warrior',
            description: 'Maintain a 30-day check-in streak',
            icon: '🔥',
            rarity: 'epic',
            unlocked: false,
            progress: 40,
            criteria: 'Check in for 30 consecutive days (currently 12/30)'
        },
        {
            id: 5,
            name: 'Tribe Legend',
            description: 'Help your tribe achieve 1000 completed tasks',
            icon: '👑',
            rarity: 'legendary',
            unlocked: false,
            progress: 14,
            criteria: 'Tribe completes 1000 tasks (currently 142/1000)'
        },
        {
            id: 6,
            name: 'Perfect Week',
            description: 'Complete all daily goals for 7 consecutive days',
            icon: '✨',
            rarity: 'rare',
            unlocked: true,
            unlockedDate: new Date(Date.now() - 1 * 86400000),
            progress: 100,
            criteria: 'Complete all goals for 7 days straight'
        },
        {
            id: 7,
            name: 'Buddy Champion',
            description: 'Complete 20 buddy sessions',
            icon: '🤝',
            rarity: 'rare',
            unlocked: false,
            progress: 35,
            criteria: 'Complete 20 buddy sessions (currently 7/20)'
        },
        {
            id: 8,
            name: 'Problem Solver',
            description: 'Have 10 of your solutions upvoted',
            icon: '💡',
            rarity: 'epic',
            unlocked: false,
            progress: 50,
            criteria: 'Get 10 total votes on solutions (currently 5/10)'
        }
    ]

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'common':
                return 'bg-gray-100 text-gray-700 border-gray-300'
            case 'rare':
                return 'bg-blue-100 text-blue-700 border-blue-300'
            case 'epic':
                return 'bg-purple-100 text-purple-700 border-purple-300'
            case 'legendary':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300'
        }
    }

    const filteredAchievements = achievements.filter(achievement => {
        if (filter === 'unlocked') return achievement.unlocked
        if (filter === 'locked') return !achievement.unlocked
        return true
    })

    const totalUnlocked = achievements.filter(a => a.unlocked).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Achievements
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {totalUnlocked} of {achievements.length} unlocked ({Math.round((totalUnlocked / achievements.length) * 100)}%)
                    </p>
                </div>
                <div className="flex gap-2">
                    {['all', 'unlocked', 'locked'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors capitalize ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Progress Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">Overall Progress</span>
                            <span className="text-gray-900 font-semibold">{totalUnlocked}/{achievements.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 h-3 rounded-full transition-all"
                                style={{ width: `${(totalUnlocked / achievements.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map(achievement => (
                    <Card
                        key={achievement.id}
                        className={`relative overflow-hidden transition-all ${achievement.unlocked
                                ? 'hover:shadow-lg cursor-pointer'
                                : 'opacity-75'
                            }`}
                    >
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* Icon & Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`text-4xl ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                                            {achievement.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                                            <Badge className={`text-xs border mt-1 ${getRarityColor(achievement.rarity)}`}>
                                                {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                    {!achievement.unlocked && (
                                        <Lock className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-600">{achievement.description}</p>

                                {/* Progress or Unlocked Date */}
                                {achievement.unlocked ? (
                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Unlocked</span>
                                            <span>
                                                {achievement.unlockedDate?.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">{achievement.criteria}</span>
                                            <span className="text-gray-900 font-semibold">{achievement.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all"
                                                style={{ width: `${achievement.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        {/* Rarity Glow Effect */}
                        {achievement.unlocked && (
                            <div className={`absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none ${achievement.rarity === 'legendary' ? 'from-yellow-400 to-orange-500' :
                                    achievement.rarity === 'epic' ? 'from-purple-400 to-pink-500' :
                                        achievement.rarity === 'rare' ? 'from-blue-400 to-cyan-500' :
                                            'from-gray-400 to-gray-500'
                                }`} />
                        )}
                    </Card>
                ))}
            </div>

            {filteredAchievements.length === 0 && (
                <Card className="py-16">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements found</h3>
                        <p className="text-gray-600">Try adjusting your filter</p>
                    </div>
                </Card>
            )}
        </div>
    )
}
