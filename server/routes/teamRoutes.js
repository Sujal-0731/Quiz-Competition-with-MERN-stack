const express = require("express");
const router = express.Router();
const Team = require("../models/Team");

// Get all teams (for school dropdown)
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find({}, "schoolName participants score");
    
    res.json({
      success: true,
      teams: teams.map(team => ({
        schoolName: team.schoolName,
        participants: team.participants,
        score: team.score
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching teams"
    });
  }
});

module.exports = router;