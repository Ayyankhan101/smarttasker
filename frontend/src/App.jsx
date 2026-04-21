import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Teams from './pages/Teams';
import Settings from './pages/Settings';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/:id" element={<TaskDetail />} />
                <Route path="teams" element={<Teams />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;