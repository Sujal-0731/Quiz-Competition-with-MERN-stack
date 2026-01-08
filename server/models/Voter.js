const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    schoolName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", voterSchema);
