import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/admin/Dashboard';



function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;