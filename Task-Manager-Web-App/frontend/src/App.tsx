import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateTask } from './pages/CreateTask';
import { Login } from './pages/Login';
import { ManageTasks } from './pages/ManageTasks';
import { Register } from './pages/Register';
import { RequireAuth } from './components/RequireAuth';
import { TeamMembers } from './pages/TeamMembers';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tasks" element={<ManageTasks />} />
          <Route path="create-task" element={<CreateTask />} />
          <Route path="team" element={<TeamMembers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
