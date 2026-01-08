const Judge = require("../models/Judge");
const Team = require("../models/Team");
const Voter = require("../models/Voter");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Helper function to set HttpOnly cookie
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // false for localhost
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
};

// ---------- LOGIN SERVICE (COMPLETE FIXED VERSION) ----------

exports.loginService = async (req, res, role) => {
  try {
    const { username, password, schoolName, name } = req.body;
    
    console.log(`Login attempt for role: ${role}`);
    console.log('Request body:', req.body);

    // ADMIN LOGIN
    if (role === "admin") {
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Username and password required" 
        });
      }

      // Check if using environment variables or database
      if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
        // Using environment variables
        if (username === process.env.ADMIN_USERNAME && 
            password === process.env.ADMIN_PASSWORD) {
          
          const token = generateToken({ 
            id: 'admin-' + Date.now(), 
            role: "admin" 
          });
          
          // ✅ SET HttpOnly COOKIE
          setAuthCookie(res, token);
          
          console.log('Admin login successful');
          
          return res.json({ 
            success: true,
            message: 'Admin login successful',
            token, // Optional for debugging
            role: "admin",
            admin: { 
              id: 'admin-' + Date.now(), 
              username, 
              role: "admin" 
            }
          });
        }
      } else {
        // Using database (check if you have Admin model)
        // const Admin = require("../models/Admin");
        // const admin = await Admin.findOne({ username });
        // if (admin && await bcrypt.compare(password, admin.password)) {
        //   // ... similar to judge login
        // }
      }
      
      return res.status(401).json({ 
        success: false, 
        message: "Invalid admin credentials" 
      });
    }

    // JUDGE LOGIN
    if (role === "judge") {
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Username and password required" 
        });
      }

      const judge = await Judge.findOne({ username });
      if (!judge) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      const valid = await bcrypt.compare(password, judge.password);
      if (!valid) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      const token = generateToken({ 
        id: judge._id, 
        role: "judge" 
      });
      
      // ✅ SET HttpOnly COOKIE
      setAuthCookie(res, token);
      
      console.log('Judge login successful:', judge.username);
      
      return res.json({ 
        success: true,
        message: 'Judge login successful',
        token,
        user: { 
          id: judge._id, 
          username: judge.username, 
          role: "judge" 
        }
      });
    }

    // TEAM LOGIN
    if (role === "team") {
      if (!schoolName || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "School name and password required" 
        });
      }

      const team = await Team.findOne({ schoolName });
      if (!team) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Check if team has password or teamCode
      let valid = false;
      if (team.password) {
        valid = await bcrypt.compare(password, team.password);
      } else if (team.teamCode) {
        valid = (team.teamCode === password);
      }
      
      if (!valid) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      const token = generateToken({ 
        id: team._id, 
        role: "team" 
      });
      
      // ✅ SET HttpOnly COOKIE
      setAuthCookie(res, token);
      
      console.log('Team login successful:', team.schoolName);
      
      return res.json({ 
        success: true,
        message: 'Team login successful',
        token,
        user: { 
          id: team._id, 
          schoolName: team.schoolName, 
          participants: team.participants,
          role: "team" 
        }
      });
    }

    // VOTER LOGIN
    if (role === "voter") {
      if (!name || !schoolName) {
        return res.status(400).json({ 
          success: false, 
          message: "Name and school name required" 
        });
      }

      let voter = await Voter.findOne({ name, schoolName });
      if (!voter) {
        voter = await Voter.create({ 
          name, 
          schoolName,
          role: "voter" 
        });
        console.log('New voter created:', name);
      }

      const token = generateToken({ 
        id: voter._id, 
        role: "voter" 
      });
      
      // ✅ SET HttpOnly COOKIE
      setAuthCookie(res, token);
      
      console.log('Voter login successful:', name);
      
      return res.json({ 
        success: true,
        message: 'Voter login successful',
        token,
        user: { 
          id: voter._id, 
          name: voter.name, 
          schoolName: voter.schoolName,
          role: "voter" 
        }
      });
    }

    // Invalid role
    return res.status(400).json({ 
      success: false, 
      message: "Invalid role specified" 
    });

  } catch (error) {
    console.error('Login service error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
};

// ---------- REGISTER SERVICES ----------

exports.judgeRegisterService = async (username, password) => {
  const existing = await Judge.findOne({ username });
  if (existing) throw new Error("Judge already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const judge = await Judge.create({ username, password: hashedPassword });

  const token = generateToken({ id: judge._id, role: "judge" });

  return { token, user: { id: judge._id, username, role: "judge" } };
};

exports.teamRegisterService = async (schoolName, password, participants) => {
  const existing = await Team.findOne({ schoolName });
  if (existing) throw new Error("Team already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const team = await Team.create({
    schoolName,
    password: hashedPassword,
    participants
  });

  const token = generateToken({ id: team._id, role: "team" });

  return { token, user: { id: team._id, schoolName, role: "team" } };
};

// ---------- CHECK AUTH SERVICE ----------

exports.checkAuthService = async (req, res) => {
  try {
    const token = req.cookies?.token;
    
    console.log('Check auth - Token cookie exists:', !!token);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Check auth - Decoded token:', decoded);
    
    return res.json({
      success: true,
      user: {
        id: decoded.id,
        role: decoded.role
      }
    });
    
  } catch (error) {
    console.error('Check auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ---------- LOGOUT SERVICE ----------

exports.logoutService = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};