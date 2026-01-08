import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../../services/authServices';
import './Admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAndFetchData = async () => {
      try {
        // Check if user is authenticated via backend
        const authResponse = await checkAuth();
        if (authResponse.success && authResponse.user.role === 'admin') {
          // Fetch admin-specific data from backend
          // const adminData = await fetchAdminData();
          // setUserData(adminData);
          setUserData({ username: 'Admin' }); // Temporary
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {userData?.username || 'Admin'}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      {/* Rest of your component */}
    </div>
  );
};

export default AdminDashboard;