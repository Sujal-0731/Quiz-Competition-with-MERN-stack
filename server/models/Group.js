const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  name: {
    type: String,
    default: function() {
      return `Group ${this.groupNumber}`;
    }
  },
  
  // Teams in this group (array of references)
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  }],
  
  // Team details for quick display (denormalized)
  teamDetails: [{
    schoolName: String,
    participants: [String],
    currentScore: { type: Number, default: 0 }
  }],
  
  // Judge assigned to this group
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Judge'
  },
  
  // Judge details for quick display
  judgeDetails: {
    username: String
  },
  
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update teamDetails when teams array changes
groupSchema.pre('save', async function(next) {
  if (this.isModified('teams')) {
    const Team = mongoose.model('Team');
    const teams = await Team.find({ _id: { $in: this.teams } })
      .select('schoolName participants score');
    
    this.teamDetails = teams.map(team => ({
      schoolName: team.schoolName,
      participants: team.participants,
      currentScore: team.score || 0
    }));
  }
  
  if (this.isModified('judge')) {
    const Judge = mongoose.model('Judge');
    const judge = await Judge.findById(this.judge).select('username');
    if (judge) {
      this.judgeDetails = { username: judge.username };
    }
  }
  
  next();
});

module.exports = mongoose.model("Group", groupSchema);