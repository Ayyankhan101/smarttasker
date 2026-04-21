import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tasks as tasksApi, teams as teamsApi, users as usersApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Plus, AlertTriangle } from 'lucide-react';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState({ status: '' });
    const [showModal, setShowModal] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [warningTask, setWarningTask] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '', 
        teamId: null, 
        assignedTo: null 
    });
    const { success, error } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        try {
            const [tasksRes, teamsRes, usersRes] = await Promise.all([
                tasksApi.getAll(filter.status ? { status: filter.status } : {}),
                teamsApi.getAll(),
                usersApi.getAll()
            ]);
            setTasks(tasksRes.data);
            setTeams(teamsRes.data);
            setUsers(usersRes.data);
            
            const unassigned = tasksRes.data.filter(t => !t.assigned_to && t.status !== 'completed' && t.status !== 'archived');
            if (unassigned.length > 0) {
                setWarningTask(unassigned[0]);
                setShowWarning(true);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await tasksApi.create(formData);
            setShowModal(false);
            setFormData({ title: '', description: '', teamId: null, assignedTo: null });
            fetchData();
            success('Task created');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to create task';
            error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this task?')) return;
        try {
            await tasksApi.delete(id);
            fetchData();
            success('Task deleted');
        } catch (err) {
            error('Failed to delete task');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            created: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            blocked: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800',
            archived: 'bg-gray-100 text-gray-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div>
            {showWarning && warningTask && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-yellow-600" size={20} />
                        <span>
                            Task <strong>"{warningTask.title}"</strong> has been unassigned for over 7 days. 
                            Consider assigning it to a team member.
                        </span>
                    </div>
                    <button 
                        onClick={() => setShowWarning(false)}
                        className="text-yellow-600 hover:text-yellow-800"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tasks</h2>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <Plus size={20} />
                    New Task
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-4 border-b flex gap-4">
                    <select 
                        value={filter.status} 
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="">All Status</option>
                        <option value="created">Created</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="divide-y">
                    {tasks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No tasks found</div>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className="p-4 flex justify-between items-center">
                                <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-sm text-gray-500">
                                        {task.assigned_to_name || <span className="text-red-500">Unassigned</span>} • {task.team_name || 'No Team'}
                                        {task.blocked_reason && <span className="text-red-500 ml-2">⚠️ {task.blocked_reason}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(task.status)}`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(task.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Create Task</h3>
                        <div className="mb-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded">
                            💡 Tip: Assigning a team member helps track accountability
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={3}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Team (Optional)</label>
                                <select
                                    value={formData.teamId || ''}
                                    onChange={(e) => setFormData({ ...formData, teamId: e.target.value ? Number(e.target.value) : null })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="">No Team</option>
                                    {teams.map(team => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Assign To (Optional)</label>
                                <select
                                    value={formData.assignedTo || ''}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value ? Number(e.target.value) : null })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                                    Create
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border py-2 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}