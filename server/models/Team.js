const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  teamCode: {
    type: String,
    required: true
  },
  participants: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 4;
      },
      message: 'Exactly 4 participants required'
    }
  },
  
  // ROUND-WISE SCORES
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

// Middleware to calculate totals when scores change
teamSchema.pre('save', function(next) {
  if (this.isModified('scores')) {
    // Calculate round totals
    this.scores.round1.totalScore = this.scores.round1.judgeScore;
    this.scores.round2.totalScore = this.scores.round2.judgeScore;
    this.scores.round3.totalScore = 
      this.scores.round3.judgeScore + this.scores.round3.voterScore;
    
    // Calculate overall totals
    this.totalJudgeScore = 
      this.scores.round1.judgeScore + 
      this.scores.round2.judgeScore + 
      this.scores.round3.judgeScore;
    
    this.totalVoterScore = this.scores.round3.voterScore;
    
    // Final score (you can adjust weights here)
    this.finalScore = 
      this.scores.round1.totalScore + 
      this.scores.round2.totalScore + 
      this.scores.round3.totalScore;
  }
  next();
});

module.exports = mongoose.model("Team", teamSchema);