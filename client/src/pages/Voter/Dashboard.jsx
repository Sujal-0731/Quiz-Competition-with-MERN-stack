import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../../services/authServices';
//import './Voter.css';

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [voterData, setVoterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchVoterData = async () => {
      try {
        const authResponse = await checkAuth();
        
        if (authResponse.success && authResponse.user?.role === 'voter') {
          // Fetch voter-specific data
          // TODO: Replace with actual API call
          // const voterInfo = await fetch(`/api/voters/${authResponse.user.id}`);
          // setVoterData(await voterInfo.json());
          
          setVoterData({ name: 'Voter' }); // Temporary data
          
          // Fetch teams for voting
          // TODO: Replace with actual API call
          // const teamsResponse = await fetch('/api/teams');
          // setTeams(await teamsResponse.json());
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

    fetchVoterData();
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
    return <div className="loading">Loading voter dashboard...</div>;
  }

  return (
    <div className="voter-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Voter Dashboard</h1>
          <p>Welcome, {voterData?.name || 'Voter'}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <h2>Vote for Teams</h2>
        <p>Select your favorite teams from the competition.</p>
        
        <div className="voting-section">
          {/* Teams list for voting */}
          <div className="teams-list">
            {/* Map through teams */}
            <p>Teams list will appear here</p>
          </div>
          
          <div className="voting-actions">
            <button className="vote-btn">Submit Your Votes</button>
            <button className="results-btn">View Current Results</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard;