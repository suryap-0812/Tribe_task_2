import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import PendingTasks from './pages/PendingTasks'
import MyTribes from './pages/MyTribes'
import FocusSessions from './pages/FocusSessions'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

            <Route path="/*" element={
                user ? (
                    <div className="min-h-screen bg-gray-50">
                        <Header />
                        <main className="container py-8">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/pending-tasks" element={<PendingTasks />} />
                                <Route path="/my-tribes" element={<MyTribes />} />
                                <Route path="/focus-sessions" element={<FocusSessions />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </div>
                ) : (
                    <Navigate to="/login" replace />
                )
            } />
        </Routes>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App
