import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../../services/authServices';
//import './Team.css';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const authResponse = await checkAuth();
        
        if (authResponse.success && authResponse.user?.role === 'team') {
          // Fetch team-specific data using the authenticated user ID
          // TODO: Replace with actual API call
          // const teamInfo = await fetch(`/api/teams/${authResponse.user.id}`);
          // const data = await teamInfo.json();
          // setTeamData(data);
          
          // Temporary data - in real app, get from backend
          setTeamData({
            schoolName: 'Your School',
            participants: ['Participant 1', 'Participant 2', 'Participant 3', 'Participant 4'],
            score: 0
          });
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

    fetchTeamData();
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
    return <div className="loading">Loading team dashboard...</div>;
  }

  return (
    <div className="team-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Team Dashboard</h1>
          <p>Welcome, {teamData?.schoolName || 'Team'}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="team-info">
          <h2>Team Information</h2>
          <p><strong>Participants:</strong> {teamData?.participants?.join(', ') || 'N/A'}</p>
          <p><strong>Current Score:</strong> {teamData?.score || 0}</p>
        </div>
        
        <div className="team-actions">
          <button className="action-btn">View Project Details</button>
          <button className="action-btn">Update Project</button>
          <button className="action-btn">View Judge Feedback</button>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;