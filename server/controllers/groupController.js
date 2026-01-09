const groupService = require('../services/groupServices');

exports.getAvailableTeams = async (req, res) => {
  try {
    const teams = await groupService.getAvailableTeams();
    res.json({
      success: true,
      teams,
      count: teams.length
    });
  } 
  catch (error) {
    console.error('Error fetching available teams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available teams'
    });
  }
};

exports.createGroup = async (req, res) => {
  try {
    console.log('🎯 Creating new group request received');
    console.log('Request body:', req.body);
    
    const { teamIds, judgeId } = req.body;
    
    // Validate request
    if (!teamIds || !Array.isArray(teamIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'teamIds (array of 6 team IDs) is required' 
      });
    }
    
    // Call service to create group
    const result = await groupService.createGroup(teamIds, judgeId);
    
    res.status(201).json({
      success: true,
      message: result.message,
      group: result.group
    });
    
  } catch (error) {
    console.error('❌ Controller Error - createGroup:', error.message);
    
    if (error.message.includes('exactly 6 teams') || 
        error.message.includes('Only') ||
        error.message.includes('not available')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create group' 
    });
  }
};

exports.getAvailableGroups=async(req,res)=>{
  try{
    const groups=await groupService.getAvailableGroups();
    res.json({
      success: true,
      groups,
      count: groups.length
    });
  } catch (error) {
    console.error('Error fetching available groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available groups'
    });
  }
}
