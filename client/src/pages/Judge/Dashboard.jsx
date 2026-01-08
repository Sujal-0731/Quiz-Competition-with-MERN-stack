import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../../services/authServices';
//import './Judge.css';

const JudgeDashboard = () => {
  const navigate = useNavigate();
  const [judgeData, setJudgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJudgeData = async () => {
      try {
        const authResponse = await checkAuth();
        
        if (authResponse.success && authResponse.user?.role === 'judge') {
          // Fetch judge-specific data
          // TODO: Replace with actual API call
          // const judgeInfo = await fetch(`/api/judges/${authResponse.user.id}`);
          // setJudgeData(await judgeInfo.json());
          
          setJudgeData({ username: 'Judge' }); // Temporary data
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

    fetchJudgeData();
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
    return <div className="loading">Loading judge dashboard...</div>;
  }

  return (
    <div className="judge-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Judge Dashboard</h1>
          <p>Welcome, {judgeData?.username || 'Judge'}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        {/* Judge-specific content */}
        <h2>Your Assigned Teams</h2>
        {/* Team scoring interface */}
      </div>
    </div>
  );
};

export default JudgeDashboard;