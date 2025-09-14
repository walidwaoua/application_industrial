import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/admin/Dashboard';
import FormPage from './components/FormPage';
import FormList from './components/FormList';
import Stock from './components/Stock';
import AddUser from './components/admin/AddUser';
import Analyse from './components/admin/Analyse';
import User from './components/admin/User';
import Atelier from './components/Atelier';
import ProtectedRoute from './ProtectedRoute';
import Logout from './components/Logout';
import Profile from './components/Profile';
import Settings from './components/Settings';



function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <FormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/form-list"
          element={
            <ProtectedRoute>
              <FormList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-user"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analyse"
          element={
            <ProtectedRoute>
              <Analyse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ateliers"
          element={
            <ProtectedRoute>
              <Atelier />
            </ProtectedRoute>
          }
        />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
