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
  
  // Teams in this group - FIXED VALIDATION
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  }],
  
  // Judge assigned to this group
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Judge'
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
  
}, { timestamps: true });

// ========== FIXED VALIDATION ==========
// Add array validation at the schema level, not element level
groupSchema.path('teams').validate(function(teams) {
  return teams.length === 6;
}, 'A group must have exactly 6 teams');

module.exports = mongoose.model("Group", groupSchema);