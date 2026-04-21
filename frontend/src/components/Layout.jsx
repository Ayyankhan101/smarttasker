import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasks as tasksApi } from '../api/client';
import { Home, ListTodo, Users, Settings, LogOut, Shield } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ total: 0, pending: 0 });

    useEffect(() => {
        if (!user) return;
        tasksApi.getAll().then(res => {
            const tasks = res.data;
            setCounts({
                total: tasks.length,
                pending: tasks.filter(t => t.status === 'in_progress').length
            });
        });
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex">
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-blue-600">SmartTasker</h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                        <Home size={20} />
                        Dashboard
                    </Link>
                    <Link to="/tasks" className="flex items-center justify-between px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                            <ListTodo size={20} />
                            Tasks
                        </div>
                        {counts.pending > 0 && (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {counts.pending}
                            </span>
                        )}
                    </Link>
                    {user?.role === 'admin' && (
                        <Link to="/teams" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                            <Users size={20} />
                            Teams
                        </Link>
                    )}
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                        <Settings size={20} />
                        Settings
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{user?.name}</span>
                        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>
            <main className="ml-64 flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}