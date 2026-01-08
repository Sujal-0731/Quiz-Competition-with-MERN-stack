const questionSchema = new mongoose.Schema({
  round: {
    type: Number,
    enum: [1, 2], // 1 = GK, 2 = Random Topics
    required: true
  },
  groupNumber: {
    type: Number,
    required: true
  },
  questionNumber: {
    type: Number, // 1-30 for each round
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  category: {
    type: String, // For round 2: 'Science', 'History', etc.
    required: function() { return this.round === 2; }
  },
  maxPoints: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Each group has 30 questions per round
questionSchema.index({ groupNumber: 1, round: 1, questionNumber: 1 }, { unique: true });