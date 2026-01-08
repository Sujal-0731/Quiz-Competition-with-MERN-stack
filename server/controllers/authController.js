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
    console.log("tring to register team");
    console.log("registerTeam body:", req.body);
    const { schoolName, password, participants } = req.body;
    if (!schoolName || !password || !participants || participants.length !== 4) {
      return res.status(400).json({ message: "All fields required and 4 participants needed" });
    }

    const data = await authServices.teamRegisterService(schoolName, password, participants);
    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({ message: err.message });
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