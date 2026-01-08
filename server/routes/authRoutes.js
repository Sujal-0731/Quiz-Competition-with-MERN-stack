const express = require("express");
const router = express.Router();
const {
  registerJudge,
  registerTeam,
  loginAdmin,
  loginJudge,
  loginTeam,
  loginVoter
} = require("../controllers/authController");

const authServices = require("../services/authServices");

// ---- REGISTER ----
router.post("/judge/register", registerJudge);
router.post("/team/register", registerTeam);

// ---- LOGIN ----
router.post("/admin/login", loginAdmin);
router.post("/judge/login", loginJudge);
router.post("/team/login", loginTeam);
router.post("/voter/login", loginVoter);

// ---- LOGOUT ----
router.post("/logout", (req, res) => {
  authServices.logoutService(req, res);
});

// ---- CHECK AUTH ----
router.get("/check", (req, res) => {
  authServices.checkAuthService(req, res);
});

module.exports = router;