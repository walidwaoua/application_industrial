import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';

// Placeholder protected component
function Dashboard() {
  return (
    <div className="App-header">
      <h1>Dashboard</h1>
      <p>You are logged in.</p>
    </div>
  );
}

// Very simple protected route check
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace state={{ from: '/dashboard' }} />;
  }
  return children;
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;