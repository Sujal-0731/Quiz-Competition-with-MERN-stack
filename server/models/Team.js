const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  participants: {
  type: [String],
  required: true,
  validate: {
    validator: function(arr) {
      // Check: exactly 4 items AND all are non-empty strings
      return arr.length === 4 && 
             arr.every(participant => 
               typeof participant === 'string' && 
               participant.trim().length > 0
             );
    },
    message: 'Exactly 4 non-empty participant names are required'
    }
  },
  scores: {
    round1: {  // GK Round (100% judge)
      judgeScore: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 }
    },
    round2: {  // Random Topics Round (100% judge)
      judgeScore: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 }
    },
    round3: {  // Audience Round (50% judge + 50% voters)
      judgeScore: { type: Number, default: 0 }, // 0-50
      voterScore: { type: Number, default: 0 }, // Calculated from votes
      totalScore: { type: Number, default: 0 }  // judgeScore + voterScore
    }
  },
  
  // CALCULATED TOTALS
  totalJudgeScore: { type: Number, default: 0 },
  totalVoterScore: { type: Number, default: 0 },
  finalScore: { type: Number, default: 0 },
  
  groupNumber: { type: Number, default: null },
  status: {
    type: String,
    enum: ['available', 'assigned', 'disqualified'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

teamSchema.methods.calculateScores = function() {
  this.scores.round1.totalScore = this.scores.round1.judgeScore;
  this.scores.round2.totalScore = this.scores.round2.judgeScore;
  this.scores.round3.totalScore = 
    this.scores.round3.judgeScore + this.scores.round3.voterScore;
  
  this.totalJudgeScore = 
    this.scores.round1.judgeScore + 
    this.scores.round2.judgeScore + 
    this.scores.round3.judgeScore;
  
  this.totalVoterScore = this.scores.round3.voterScore;
  
  this.finalScore = 
    this.scores.round1.totalScore + 
    this.scores.round2.totalScore + 
    this.scores.round3.totalScore;
  
  return this;
};

module.exports = mongoose.model("Team", teamSchema);