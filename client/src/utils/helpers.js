// Format time in hours and minutes
export const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
        return `${mins}m`
    }

    return `${hours}h ${mins}m`
}

// Format date
export const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric' }
    return new Intl.DateTimeFormat('en-US', options).format(date)
}

// Format relative date
export const formatRelativeDate = (date) => {
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'

    return formatDate(date)
}

// Get priority color
export const getPriorityColor = (priority) => {
    const colors = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-orange-100 text-orange-700',
        low: 'bg-blue-100 text-blue-700',
    }
    return colors[priority] || colors.low
}

// Get tribe color
export const getTribeColor = (color) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        green: 'bg-green-100 text-green-700',
        orange: 'bg-orange-100 text-orange-700',
        pink: 'bg-pink-100 text-pink-700',
    }
    return colors[color] || colors.blue
}
