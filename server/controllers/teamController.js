// server/controllers/teamController.js
const teamService = require('../services/teamServices');

class TeamController {
  // Get all teams
  async getAllTeams(req, res) {
    try {
      const filters = {
        status: req.query.status,
        groupNumber: req.query.groupNumber,
        search: req.query.search
      };
      
      const teams = await teamService.getAllTeams(filters);
      
      res.json({
        success: true,
        teams,
        count: teams.length
      });
      
    } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch teams'
      });
    }
  }
  
  // Create team
  async createTeam(req, res) {
    try {
      const team = await teamService.createTeam(req.body);
      
      res.json({
        success: true,
        message: 'Team created successfully',
        team
      });
      
    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create team',
        error: error.message
      });
    }
  }
  
  // Update team
  async updateTeam(req, res) {
    try {
      const team = await teamService.updateTeam(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Team updated successfully',
        team
      });
      
    } catch (error) {
      console.error('Error updating team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update team',
        error: error.message
      });
    }
  }
  
  // Delete team
  async deleteTeam(req, res) {
    try {
      const result = await teamService.deleteTeam(req.params.id);
      
      res.json(result);
      
    } catch (error) {
      console.error('Error deleting team:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete team',
        error: error.message
      });
    }
  }
  
  // Import teams
  async importTeams(req, res) {
    try {
      const { teamsData } = req.body;
      
      if (!Array.isArray(teamsData) || teamsData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teams data'
        });
      }
      
      const results = await teamService.importTeams(teamsData);
      
      res.json({
        success: true,
        message: `Imported ${results.success} teams, ${results.failed} failed`,
        results
      });
      
    } catch (error) {
      console.error('Error importing teams:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import teams'
      });
    }
  }
}

module.exports = new TeamController();