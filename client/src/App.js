import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from './components/ProtectedRoute';
import Home from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from './pages/Admin/Dashboard';
import JudgeDashboard from './pages/Judge/Dashboard';
import TeamDashboard from './pages/Team/Dashboard';
import VoterDashboard from './pages/Voter/Dashboard';
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/judge/dashboard" element={
          <ProtectedRoute allowedRole="judge">
            <JudgeDashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes - Team */}
        <Route path="/team/dashboard" element={
          <ProtectedRoute allowedRole="team">
            <TeamDashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes - Voter */}
        <Route path="/voter/dashboard" element={
          <ProtectedRoute allowedRole="voter">
            <VoterDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
