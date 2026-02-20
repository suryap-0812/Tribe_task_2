import { useState, useEffect, useRef } from 'react'
import { Send, Smile, Paperclip, Search, MoreVertical } from 'lucide-react'
import Card, { CardContent } from './ui/Card'
import Button from './ui/Button'
import { tribesAPI } from '../services/api'
import { io } from 'socket.io-client'

export default function TribeChat({ tribeId, currentUser, messages: initialMessages, onSendMessage, onReact }) {
    const socketRef = useRef(null)
    const [messages, setMessages] = useState(initialMessages || [])
    const [newMessage, setNewMessage] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const emojis = ['👍', '❤️', '😂', '🎉', '🔥', '👏', '💯', '🚀']

    useEffect(() => {
        const fetchMessages = async () => {
            if (tribeId) {
                try {
                    const data = await tribesAPI.getMessages(tribeId)
                    setMessages(data.messages || [])
                } catch (error) {
                    console.error('Failed to fetch messages:', error)
                }
            }
        }
        fetchMessages()

        // Socket.io initialization
        socketRef.current = io({
            auth: {
                token: localStorage.getItem('token')
            }
        })

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server:', socketRef.current.id)
            socketRef.current.emit('join_tribe', tribeId)
        })

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message)
        })

        socketRef.current.on('receive_message', (message) => {
            setMessages(prev => {
                // De-duplicate: check if message already exists
                const exists = prev.find(m => (m._id || m.id) === (message._id || message.id))
                if (exists) return prev
                return [...prev, message]
            })
        })

        socketRef.current.on('receive_reaction', ({ messageId, message }) => {
            setMessages(prev => prev.map(msg =>
                (msg._id || msg.id) === messageId ? message : msg
            ))
        })

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_tribe', tribeId)
                socketRef.current.off('receive_message')
                socketRef.current.disconnect()
            }
        }
    }, [tribeId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            try {
                const data = await tribesAPI.sendMessage(tribeId, {
                    content: newMessage,
                    mentions: extractMentions(newMessage)
                })

                if (onSendMessage) {
                    onSendMessage(data.message)
                }

                // Emit to socket for real-time update
                if (socketRef.current) {
                    socketRef.current.emit('send_message', {
                        tribeId,
                        message: data.message
                    })
                }

                setMessages([...messages, data.message])
                setNewMessage('')
                setShowEmojiPicker(false)
            } catch (error) {
                console.error('Failed to send message:', error)
                alert('Failed to send message')
            }
        }
    }

    const handleReaction = async (messageId, emoji) => {
        try {
            const data = await tribesAPI.addReaction(tribeId, messageId, { emoji })

            // Update local state with the returned message object
            const updatedMessages = messages.map(msg =>
                msg._id === messageId ? data.message : msg
            )
            setMessages(updatedMessages)

            // Emit to socket for real-time update
            if (socketRef.current) {
                socketRef.current.emit('send_reaction', {
                    tribeId,
                    messageId,
                    message: data.message
                })
            }

            if (onReact) {
                onReact(messageId, emoji)
            }
        } catch (error) {
            console.error('Failed to add reaction:', error)
        }
    }

    const extractMentions = (text) => {
        const mentionRegex = /@(\w+)/g
        const mentions = []
        let match
        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push(match[1])
        }
        return mentions
    }

    const highlightMentions = (text) => {
        return text.split(/(@\w+)/g).map((part, index) => {
            if (part.startsWith('@')) {
                return (
                    <span key={index} className="text-primary font-semibold bg-primary/10 px-1 rounded">
                        {part}
                    </span>
                )
            }
            return part
        })
    }

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInHours = (now - date) / (1000 * 60 * 60)

        if (diffInHours < 1) {
            const minutes = Math.floor((now - date) / (1000 * 60))
            return minutes === 0 ? 'Just now' : `${minutes}m ago`
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
    }

    const filteredMessages = messages.filter(msg =>
        searchQuery === '' ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const groupReactions = (reactions) => {
        const grouped = {}
        reactions?.forEach(r => {
            if (!grouped[r.emoji]) {
                grouped[r.emoji] = []
            }
            grouped[r.emoji].push(r.userName)
        })
        return grouped
    }

    return (
        <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        💬
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Tribe Chat</h3>
                        <p className="text-xs text-gray-500">{messages.length} messages</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-600 text-sm">Be the first to start the conversation!</p>
                    </div>
                ) : (
                    filteredMessages.map((msg, index) => {
                        const isCurrentUser = msg.sender._id === currentUser._id
                        const showAvatar = index === 0 || filteredMessages[index - 1].sender._id !== msg.sender._id
                        const groupedReactions = groupReactions(msg.reactions)

                        return (
                            <div
                                key={msg._id || msg.id}
                                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${!showAvatar && !isCurrentUser ? 'ml-11' : ''}`}
                            >
                                {showAvatar && !isCurrentUser && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                        {msg.sender.avatar || (msg.sender.name ? msg.sender.name.substring(0, 2).toUpperCase() : '??')}
                                    </div>
                                )}

                                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    {showAvatar && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{msg.sender.name}</span>
                                            <span className="text-xs text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                                        </div>
                                    )}

                                    <div className="group relative">
                                        <div className={`px-4 py-2 rounded-2xl ${isCurrentUser
                                            ? 'bg-primary text-white'
                                            : 'bg-white border border-gray-200 text-gray-900'
                                            }`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {highlightMentions(msg.content)}
                                            </p>
                                        </div>

                                        {/* Reaction Picker */}
                                        <div className="hidden group-hover:flex absolute -bottom-6 left-0 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1 gap-1">
                                            {emojis.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(msg._id || msg.id, emoji)}
                                                    className="hover:scale-125 transition-transform text-lg"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Reactions Display */}
                                    {msg.reactions && msg.reactions.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {Object.entries(groupedReactions).map(([emoji, users]) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(msg._id || msg.id, emoji)}
                                                    className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-0.5 hover:bg-gray-50 transition-colors"
                                                    title={users.join(', ')}
                                                >
                                                    <span className="text-sm">{emoji}</span>
                                                    <span className="text-xs text-gray-600">{users.length}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                            placeholder="Type a message... (use @name to mention)"
                            className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            rows="1"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Smile className="w-5 h-5 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Paperclip className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 grid grid-cols-8 gap-2">
                                {emojis.concat(['😊', '😍', '🤔', '😎', '🙌', '✨', '💪', '🎯']).map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => {
                                            setNewMessage(newMessage + emoji)
                                            inputRef.current?.focus()
                                        }}
                                        className="text-2xl hover:scale-125 transition-transform"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
