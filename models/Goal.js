const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
  },
  targetSaved: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  achieved: {
    type: Boolean,
    default: false,
  },
});

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    currentSaved: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "achieved", "failed", "paused"],
      default: "active",
    },
    requiredMonthlySaving: {
      type: Number,
    },
    progressPercent: {
      type: Number,
      default: 0,
    },
    isFeasible: {
      type: Boolean,
      default: true,
    },
    aiPlan: {
      type: String,
    },
    milestones: [milestoneSchema],
    lastChecked: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);