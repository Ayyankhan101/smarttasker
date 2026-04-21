import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasks as tasksApi, teams as teamsApi } from '../api/client';

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, created: 0, inProgress: 0, completed: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await tasksApi.getAll();
            const allTasks = res.data;
            setStats({
                total: allTasks.length,
                created: allTasks.filter(t => t.status === 'created').length,
                inProgress: allTasks.filter(t => t.status === 'in_progress').length,
                completed: allTasks.filter(t => t.status === 'completed').length,
            });
            setRecentTasks(allTasks.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-gray-600">Total Tasks</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-yellow-600">{stats.created}</div>
                    <div className="text-gray-600">Created</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-orange-600">{stats.inProgress}</div>
                    <div className="text-gray-600">In Progress</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-gray-600">Completed</div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold">Recent Tasks</h3>
                    <Link to="/tasks" className="text-blue-600 hover:underline">View All</Link>
                </div>
                <div className="divide-y">
                    {recentTasks.length === 0 ? (
                        <div className="p-4 text-gray-500">No tasks yet. Create your first task!</div>
                    ) : (
                        recentTasks.map(task => (
                            <div key={task.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-sm text-gray-500">
                                        {task.assigned_to_name || 'Unassigned'} • {task.team_name || 'No Team'}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}