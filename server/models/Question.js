const mongoose = require("mongoose");

// Question sub-schema
const questionSchema = new mongoose.Schema({
  qn: {  // 1 to 60
    type: Number,
    required: true,
    min: 1,
    max: 60
  },
  question: {
    type: String,
    required: true  // Add this
  },
  answer: {
    type: String,
    required: true  // Add this
  },
  points: {
    type: Number,
    required: true, 
    min: 5,
    max: 20,
    default: 10
  },
  category: {
    type: String,
    required: true,
    default: "General"
  }
}, { _id: false });

// Main Group schema
const questionGroupSchema = new mongoose.Schema({
  group: {  // Group number (1, 2, etc.)
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  
  // Only 2 rounds for questions
  round1: {  // GK Round
    type: [questionSchema],
    validate: {
      validator: function(arr) {
        //return arr.length === 60;  // Must have exactly 60 questions
      },
      message: 'Round 1 must have exactly 60 questions'
    }
  },
  
  round2: {  // Random Topics Round
    type: [questionSchema],
    validate: {
      validator: function(arr) {
        //return arr.length === 60;  // Must have exactly 60 questions
      },
      message: 'Round 2 must have exactly 60 questions'
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
  
}, { timestamps: true });

// Sort questions by qn number before saving
questionGroupSchema.pre('save', function(next) {
  try {
    if (this.round1 && Array.isArray(this.round1)) {
      this.round1.sort((a, b) => a.qn - b.qn);
    }
    if (this.round2 && Array.isArray(this.round2)) {
      this.round2.sort((a, b) => a.qn - b.qn);
    }
    
    // Check if next is a function before calling
    if (typeof next === 'function') {
      next();
    }
  } catch (error) {
    if (typeof next === 'function') {
      next(error);
    } else {
      throw error;
    }
  }
});

module.exports = mongoose.model("questionGroup", questionGroupSchema);