import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  loginAdmin, 
  loginJudge, 
  loginTeam, 
  loginVoter 
} from "../services/authServices";
import "./LoginRegister.css";

const LoginPage = () => {
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schools, setSchools] = useState([]); // For school dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch schools when role is voter or on component mount
  useEffect(() => {
    if (role === "voter" || role === "team") {
      fetchSchools();
    }
  }, [role]);

  const fetchSchools = async () => {
    try {
      // TODO: Create this endpoint in backend
      // For now, you can fetch from teams endpoint
      const response = await fetch('http://localhost:5000/api/teams');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.teams) {
          const schoolNames = data.teams.map(team => team.schoolName);
          setSchools(schoolNames);
        }
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;
      
      switch (role) {
        case "admin":
          if (!username || !password) {
            throw new Error("Username and password are required");
          }
          response = await loginAdmin(username, password);
          console.log("Admin login response:", response);
          navigate("/admin/dashboard");
          break;
          
        case "judge":
          if (!username || !password) {
            throw new Error("Username and password are required");
          }
          response = await loginJudge(username, password);
          navigate("/judge/dashboard");
          break;
          
        case "team":
          if (!schoolName || !password) {
            throw new Error("School name and password are required");
          }
          response = await loginTeam(schoolName, password);
          navigate("/team/dashboard");
          break;
          
        case "voter":
          if (!username || !schoolName) {
            throw new Error("Your name and school name are required");
          }
          response = await loginVoter(username, schoolName);
          navigate("/voter/dashboard");
          break;
          
        default:
          throw new Error("Invalid role selected");
      }
      
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Clear fields when role changes
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setUsername("");
    setPassword("");
    setSchoolName("");
    setError("");
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Role</label>
          <select 
            value={role} 
            onChange={(e) => handleRoleChange(e.target.value)}
            className="form-select"
          >
            <option value="admin">Admin</option>
            <option value="judge">Judge</option>
            <option value="team">Team</option>
            <option value="voter">Voter</option>
          </select>
        </div>

        {/* Admin & Judge Login */}
        {(role === "admin" || role === "judge") && (
          <>
            <div className="form-group">
              <label>{role === "admin" ? "Admin Username" : "Judge Username"}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
                placeholder={`Enter ${role} username`}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="Enter password"
              />
            </div>
          </>
        )}

        {/* Team Login */}
        {role === "team" && (
          <>
            <div className="form-group">
              <label>School Name</label>
              <select
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="form-input"
              >
                <option value="">Select your school</option>
                {schools.map((school, index) => (
                  <option key={index} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="Enter team password"
              />
            </div>
          </>
        )}

        {/* Voter Login */}
        {role === "voter" && (
          <>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Your School</label>
              <select
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="form-input"
              >
                <option value="">Select your school</option>
                {schools.map((school, index) => (
                  <option key={index} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;