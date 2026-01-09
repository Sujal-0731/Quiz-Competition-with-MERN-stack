// server/services/groupService.js
const Group = require('../models/Group');
const Team = require('../models/Team');
const Judge = require('../models/Judge');

class GroupService {
  
  async getAvailableTeams() {
    try{
      return await Team.find({ 
        status: { $in: ['available', 'pending'] },
        groupNumber: null
      }).select('schoolName participants teamCode contactPerson finalScore status');
    }  
    catch (error) {
      console.error('Error in getAvailableTeams service:', error);
      throw error;
    }
  }

    async createGroup(teamIds, judgeId = null) {
    try {
      console.log('🚀 Creating new group...');
      console.log('Team IDs to add:', teamIds);
      
      // VALIDATION: Must have exactly 6 teams
      if (!teamIds || teamIds.length !== 6) {
        throw new Error('❌ A group must have exactly 6 teams');
      }
      
      // Check if all 6 teams exist and are available
      const availableTeams = await Team.find({
        _id: { $in: teamIds },
        status: 'available',
        groupNumber: null
      });
      
      if (availableTeams.length !== 6) {
        throw new Error(`❌ Only ${availableTeams.length} teams are available. Need 6 teams.`);
      }
      
      // Get next group number (1, 2, 3...)
      const lastGroup = await Group.findOne().sort('-groupNumber');
      const nextGroupNumber = lastGroup ? lastGroup.groupNumber + 1 : 1;
      
      console.log(`Next group number: ${nextGroupNumber}`);
      
      // Validate judge if provided
      let judge = null;
      if (judgeId) {
        judge = await Judge.findOne({
          _id: judgeId,
          isAvailable: true,
          assignedGroup: null
        });
        
        if (!judge) {
          throw new Error('❌ Judge is not available');
        }
      }
      
      // CREATE THE GROUP
      const group = await Group.create({
        groupNumber: nextGroupNumber,
        teams: teamIds,
        judge: judgeId,
        name: `Group ${nextGroupNumber}`,
        status: 'active'
      });
      
      console.log(`✅ Group ${nextGroupNumber} created in database`);
      
      // UPDATE ALL 6 TEAMS: Mark them as assigned to this group
      await Team.updateMany(
        { _id: { $in: teamIds } },
        { 
          $set: { 
            groupNumber: nextGroupNumber,
            status: 'assigned'
          }
        }
      );
      
      console.log(`✅ Updated 6 teams with groupNumber: ${nextGroupNumber}`);
      
      // Update judge if assigned
      if (judge) {
        await Judge.findByIdAndUpdate(judgeId, {
          assignedGroup: nextGroupNumber,
          isAvailable: false
        });
        
        console.log(`✅ Judge ${judge.username} assigned to Group ${nextGroupNumber}`);
      }
      
      // Return the created group with populated data
      const populatedGroup = await Group.findById(group._id)
        .populate('teams', 'schoolName participants')
        .populate('judge', 'username');
      
      return {
        group: populatedGroup,
        message: `Group ${nextGroupNumber} created successfully with 6 teams`
      };
      
    } catch (error) {
      console.error('❌ Error creating group:', error.message);
      throw error;
    }
  }
  async getAvailableGroups() {
    try {
      console.log('🚀 Fetching available groups...');
      const groups = await Group.find({ status: 'active' })
        .populate('teams', 'schoolName participants')
        .populate('judge');
      
      return groups;
    } catch (error) {
      console.error('Error fetching available groups:', error);
      throw error;
    }
  }
}

module.exports = new GroupService();