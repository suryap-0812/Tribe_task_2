import { Link, useLocation } from 'react-router-dom'
import { Bell, Target, Menu, X, Settings, LogOut, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Badge from '../ui/Badge'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
    const location = useLocation()
    const { user, logout } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navItems = [
        { path: '/', label: 'Dashboard' },
        { path: '/pending-tasks', label: 'Pending Tasks' },
        { path: '/my-tribes', label: 'My Tribes' },
        { path: '/focus-sessions', label: 'Focus Sessions' },
        { path: '/analytics', label: 'Analytics' },
    ]

    const userInitial = user?.name?.charAt(0) || 'U'

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">TribeTask</span>
                        </Link>
                    </div>

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
                        {user && (
                            <Badge variant="warning" className="hidden sm:flex">
                                🔥 Day {user.checkInStreak || 1} check-in
                            </Badge>
                        )}

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User menu */}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors outline-none">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                        {userInitial}
                                    </div>
                                </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                    className="min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200"
                                    sideOffset={8}
                                    align="end"
                                >
                                    <div className="px-3 py-2 mb-1 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>

                                    <DropdownMenu.Item asChild>
                                        <Link
                                            to="/profile"
                                            className="px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md cursor-pointer outline-none flex items-center gap-2 transition-colors"
                                        >
                                            <UserIcon className="w-4 h-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className="px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md cursor-pointer outline-none flex items-center gap-2 transition-colors">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                                    <DropdownMenu.Item
                                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer outline-none flex items-center gap-2 transition-colors"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            logout();
                                        }}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Content */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">TribeTask</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                        }}
                        className="w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}
