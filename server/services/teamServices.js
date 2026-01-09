// server/services/teamService.js
const Team = require('../models/Team');
const Group = require('../models/Group');

class TeamService {
  // Get all teams with filters
  async getAllTeams(filters = {}) {
    const query = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.groupNumber) query.groupNumber = filters.groupNumber;
    if (filters.search) {
      query.$or = [
        { schoolName: { $regex: filters.search, $options: 'i' } },
        { teamCode: { $regex: filters.search, $options: 'i' } },
        { 'contactPerson.name': { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    return await Team.find(query).sort({ createdAt: -1 });
  }
  
  // Get team by ID
  async getTeamById(teamId) {
    return await Team.findById(teamId);
  }
  
  // Create new team
  async createTeam(teamData) {
    // Check if team already exists
    const existingTeam = await Team.findOne({
      $or: [
        { schoolName: teamData.schoolName },
        { teamCode: teamData.teamCode }
      ]
    });
    
    if (existingTeam) {
      throw new Error('Team with this school name or code already exists');
    }
    
    // Generate team code if not provided
    if (!teamData.teamCode) {
      teamData.teamCode = this.generateTeamCode(teamData.schoolName);
    }
    
    const team = new Team({
      ...teamData,
      status: 'pending'
    });
    
    await team.save();
    return team;
  }
  
  // Update team
  async updateTeam(teamId, updateData) {
    const team = await Team.findByIdAndUpdate(
      teamId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    return team;
  }
  
  // Delete team
  async deleteTeam(teamId) {
    const team = await Team.findById(teamId);
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Check if team is assigned to a group
    if (team.groupNumber) {
      const group = await Group.findOne({ groupNumber: team.groupNumber });
      if (group) {
        // Remove team from group
        group.teams.pull(team._id);
        await group.save();
      }
    }
    
    await Team.findByIdAndDelete(teamId);
    
    return { success: true, message: 'Team deleted successfully' };
  }
  
  // Bulk import teams
  async importTeams(teamsData) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const teamData of teamsData) {
      try {
        await this.createTeam(teamData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          schoolName: teamData.schoolName,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  // Generate team code
  generateTeamCode(schoolName) {
    const prefix = schoolName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3);
    
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}${randomNum}`;
  }
}

module.exports = new TeamService();