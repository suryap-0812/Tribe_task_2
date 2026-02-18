import { Link, useLocation } from 'react-router-dom'
import { Bell, Target } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { currentUser } from '../../data/mockData'
import Badge from '../ui/Badge'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
    const location = useLocation()
    const { logout } = useAuth()

    const navItems = [
        { path: '/', label: 'Dashboard' },
        { path: '/pending-tasks', label: 'Pending Tasks' },
        { path: '/my-tribes', label: 'My Tribes' },
        { path: '/focus-sessions', label: 'Focus Sessions' },
        { path: '/analytics', label: 'Analytics' },
    ]

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">TribeTask</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary-50 text-primary'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {/* Check-in badge */}
                        <Badge variant="warning" className="hidden sm:flex">
                            🔥 Day {currentUser.checkInStreak} check-in
                        </Badge>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User menu */}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                        {currentUser.avatar}
                                    </div>
                                </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                    className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
                                    sideOffset={5}
                                >
                                    <DropdownMenu.Item asChild>
                                        <Link
                                            to="/profile"
                                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer outline-none flex items-center"
                                        >
                                            Profile
                                        </Link>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer outline-none">
                                        Settings
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                                    <DropdownMenu.Item
                                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer outline-none"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            logout();
                                        }}
                                    >
                                        Logout
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                </div>
            </div>
        </header>
    )
}
