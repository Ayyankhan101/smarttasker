import { useState, useEffect } from 'react';
import { teams as teamsApi, users as usersApi } from '../api/client';
import { Plus } from 'lucide-react';

export default function Teams() {
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsRes, usersRes] = await Promise.all([teamsApi.getAll(), usersApi.getAll()]);
            setTeams(teamsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await teamsApi.create(formData);
            setShowModal(false);
            setFormData({ name: '', description: '' });
            fetchData();
        } catch (error) {
            alert('Failed to create team');
        }
    };

    const handleAddMember = async (teamId, userId) => {
        try {
            await teamsApi.addMember(teamId, userId);
            alert('Member added');
        } catch (error) {
            alert('Failed to add member');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this team?')) return;
        try {
            await teamsApi.delete(id);
            fetchData();
        } catch (error) {
            alert('Failed to delete team');
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Teams</h2>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <Plus size={20} />
                    New Team
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {teams.length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-gray-500">No teams yet</div>
                ) : (
                    teams.map(team => (
                        <div key={team.id} className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{team.name}</h3>
                                    <p className="text-sm text-gray-500">{team.description || 'No description'}</p>
                                </div>
                                <button onClick={() => handleDelete(team.id)} className="text-red-600 hover:text-red-800">
                                    Delete
                                </button>
                            </div>
                            <div>
                                <button 
                                    onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    {selectedTeam === team.id ? 'Hide Members' : 'Add Members'}
                                </button>
                                {selectedTeam === team.id && (
                                    <div className="mt-2 space-y-2">
                                        {users.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleAddMember(team.id, user.id)}
                                                className="block w-full text-left px-3 py-2 text-sm bg-gray-50 rounded hover:bg-gray-100"
                                            >
                                                {user.name} ({user.email})
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Create Team</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
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