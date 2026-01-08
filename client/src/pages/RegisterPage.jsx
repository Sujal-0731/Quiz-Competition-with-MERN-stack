import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  registerJudge, 
  registerTeam,
  loginJudge,
  loginTeam
} from "../services/authServices";
import "./LoginRegister.css";

const RegisterPage = () => {
  const [role, setRole] = useState("judge");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [participantNames, setParticipantNames] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;

      if (role === "judge") {
        if (!username || !password) {
          throw new Error("Username and Password are required for Judge");
        }
        response = await registerJudge(username, password);
        alert(`Judge registered: ${response.judge?.username || response.username}`);
        
        // Auto-login after registration
        await loginJudge(username, password);
        navigate("/judge/dashboard");
      }

      if (role === "team") {
        if (!schoolName || participantNames.some(name => !name)) {
          throw new Error("School name and all 4 participant names are required");
        }
        response = await registerTeam(schoolName, password, participantNames);
        alert(`Team registered: ${response.team?.schoolName || response.schoolName}`);
        
        // Auto-login after registration
        await loginTeam(schoolName, password);
        navigate("/team/dashboard");
      }

      // Reset form
      setUsername("");
      setPassword("");
      setSchoolName("");
      setParticipantNames(["", "", "", ""]);

    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantChange = (index, value) => {
    const newParticipants = [...participantNames];
    newParticipants[index] = value;
    setParticipantNames(newParticipants);
  };

  // Clear fields when role changes
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setUsername("");
    setPassword("");
    setSchoolName("");
    setParticipantNames(["", "", "", ""]);
    setError("");
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Role</label>
          <select 
            value={role} 
            onChange={(e) => handleRoleChange(e.target.value)}
            className="form-select"
          >
            <option value="judge">Judge</option>
            <option value="team">Team</option>
          </select>
        </div>

        {role === "judge" && (
          <>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
                placeholder="Choose a username"
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
                placeholder="Choose a password"
              />
            </div>
          </>
        )}

        {role === "team" && (
          <>
            <div className="form-group">
              <label>School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your school name"
              />
            </div>
            <div className="form-group">
              <label>Team Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="Choose a team password"
              />
            </div>
            {participantNames.map((name, index) => (
              <div key={index} className="form-group">
                <label>Participant {index + 1} Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    handleParticipantChange(index, e.target.value)
                  }
                  required
                  className="form-input"
                  placeholder={`Participant ${index + 1} name`}
                />
              </div>
            ))}
          </>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Already have an account?{" "}
          <span 
            className="link" 
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;