import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasks as tasksApi } from '../api/client';
import { ArrowLeft, Upload, File, Trash2, Download } from 'lucide-react';

export default function TaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', status: '' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchTask();
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await tasksApi.get(id);
            setTask(res.data);
            setFormData({
                title: res.data.title,
                description: res.data.description || '',
                status: res.data.status
            });
        } catch (error) {
            console.error('Failed to fetch task:', error);
            navigate('/tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await tasksApi.update(id, formData);
            fetchTask();
        } catch (error) {
            alert('Failed to update task');
        } finally {
            setUpdating(false);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        
        try {
            await tasksApi.uploadFile(id, formDataUpload);
            setFile(null);
            fetchTask();
        } catch (error) {
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (!confirm('Delete this file?')) return;
        try {
            await tasksApi.deleteFile(id, fileId);
            fetchTask();
        } catch (error) {
            alert('Failed to delete file');
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div>
            <button onClick={() => navigate('/tasks')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={20} />
                Back to Tasks
            </button>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={4}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="created">Created</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={updating}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                        <h3 className="font-semibold text-lg mb-4">Files</h3>
                        
                        <form onSubmit={handleFileUpload} className="flex gap-3 mb-4">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="flex-1"
                            />
                            <button
                                type="submit"
                                disabled={!file || uploading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Upload size={18} />
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </form>

                        <div className="space-y-2">
                            {task.files?.length === 0 ? (
                                <p className="text-gray-500">No files uploaded</p>
                            ) : (
                                task.files?.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div className="flex items-center gap-3">
                                            <File size={18} className="text-gray-500" />
                                            <span>{file.original_name}</span>
                                            <span className="text-sm text-gray-500">({Math.round(file.size / 1024)}KB)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`http://localhost:5000/api/tasks/${task.id}/files/${file.id}/download`}
                                                target="_blank"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Download size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="font-semibold text-lg mb-4">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Assigned to:</span>
                                <span className="ml-2">{task.assigned_to_name || 'Unassigned'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Team:</span>
                                <span className="ml-2">{task.team_name || 'No Team'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Created by:</span>
                                <span className="ml-2">{task.created_by_name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Created:</span>
                                <span className="ml-2">{new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}