const authServices = require("../services/authServices");

// ----------------- REGISTER -----------------
const registerJudge = async (req, res) => {
  console.log("registerJudge called")
  try {
    console.log("registerJudge body:", req.body);
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "All fields required" });

    const data = await authServices.judgeRegisterService(username, password);
    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const registerTeam = async (req, res) => {
  try {
    console.log("🎯 Controller: Team registration request");
    console.log("Request body:", req.body);
    
    const { schoolName, password, participants } = req.body;
    
    // Validation
    if (!schoolName || !password || !participants) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    
    if (!Array.isArray(participants) || participants.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Exactly 4 participants are required"
      });
    }
    
    // Call service layer
    const result = await authServices.teamRegisterService(
      schoolName, 
      password, 
      participants
    );
    
    // Set cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    // Success response
    return res.status(201).json({
      success: true,
      message: "Team registered successfully",
      user: result.user
    });
    
  } catch (error) {
    console.error("❌ Controller error:", error.message);
    
    // Handle specific errors
    let statusCode = 400;
    let errorMessage = error.message;
    
    if (error.message.includes("already exists")) {
      statusCode = 409; // Conflict
      errorMessage = "A team with this school name already exists";
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

// ----------------- LOGIN -----------------
const loginAdmin = async (req, res) => {
  try {
    await authServices.loginService(req, res, "admin");
  } catch (error) {
    console.error("Login error in controller:", error);
    res.status(400).json({ message: error.message });
  }
};

const loginJudge = async (req, res) => {
  try {
    await authServices.loginService(req, res, "judge");
  } catch (error) {
    console.error("Login error in controller:", error);
    res.status(400).json({ message: error.message });
  }
};

const loginTeam = async (req, res) => {
  try {
    await authServices.loginService(req, res, "team");
  } catch (error) {
    console.error("Login error in controller:", error);
    res.status(400).json({ message: error.message });
  }
};

const loginVoter = async (req, res) => {
  try {
    await authServices.loginService(req, res, "voter");
  } catch (error) {
    console.error("Login error in controller:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerJudge,
  registerTeam,
  loginAdmin,
  loginJudge,
  loginTeam,
  loginVoter
};