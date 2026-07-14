const Goal = require("../models/Goal");
const FinancialRecord = require("../models/FinancialRecord");
const { generateGoalPlan, generateProgressUpdate } = require("../utils/aiHelper");
require("dotenv").config();

const getAvgMonthlySurplus = async (userId) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const records = await FinancialRecord.find({
    user: userId,
    date: { $gte: threeMonthsAgo },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  records.forEach((r) => {
    if (r.type === "income") totalIncome += r.amount;
    else totalExpense += r.amount;
  });

  const avgMonthlyIncome = totalIncome / 3;
  const avgMonthlyExpense = totalExpense / 3;
  const surplus = avgMonthlyIncome - avgMonthlyExpense;

  return {
    avgMonthlyIncome: Math.round(avgMonthlyIncome),
    avgMonthlyExpense: Math.round(avgMonthlyExpense),
    surplus: Math.round(surplus),
  };
};

const createGoal = async (req, res) => {
  try {
    const { name, description, targetAmount, deadline } = req.body;
    const userId = req.user.id; 

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({ message: "name, targetAmount, deadline are required" });
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ message: "Deadline must be in the future" });
    }

    const monthsLeft = Math.ceil(
      (deadlineDate - new Date()) / (1000 * 60 * 60 * 24 * 30)
    );
    const requiredMonthlySaving = Math.ceil(targetAmount / monthsLeft);

    const { surplus } = await getAvgMonthlySurplus(userId);
    const isFeasible = surplus >= requiredMonthlySaving;

    const currentBalance = req.user.currentBalance || 0;

    const existingGoals = await Goal.find({ user: userId, status: "active" })
      .select("name")
      .lean();
    const existingGoalNames = existingGoals.map((g) => g.name);

    const aiResponse = await generateGoalPlan({
      goalName: name,
      targetAmount,
      deadline,
      currentBalance,
      monthlySurplus: surplus,
      requiredMonthlySaving,
      isFeasible,
      existingGoals: existingGoalNames,
    });

    const goal = await Goal.create({
      user: userId,
      name,
      description,
      targetAmount,
      deadline: deadlineDate,
      requiredMonthlySaving,
      isFeasible,
      aiPlan: aiResponse.summary,
      milestones: aiResponse.milestones,
      progressPercent: 0,
      currentSaved: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Goal created successfully",
      data: {
        goal,
        aiInsights: {
          summary: aiResponse.summary,
          feasibilityNote: aiResponse.feasibilityNote,
          tips: aiResponse.tips,
          isFeasible,
          requiredMonthlySaving,
          availableSurplus: surplus,
        },
      },
    });
  } catch (error) {
    console.error("createGoal error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: goals });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    return res.status(200).json({ success: true, data: goal });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addSavingToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id});
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.currentSaved += amount;
    goal.progressPercent = Math.min(
      Math.round((goal.currentSaved / goal.targetAmount) * 100),
      100
    );

    goal.milestones = goal.milestones.map((m) => ({
      ...m.toObject(),
      achieved: goal.currentSaved >= m.targetSaved,
    }));

    if (goal.currentSaved >= goal.targetAmount) {
      goal.status = "achieved";
    }

    await goal.save();

    return res.status(200).json({
      success: true,
      message: "Saving added",
      data: goal,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAIProgressUpdate = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const { surplus } = await getAvgMonthlySurplus(req.user.id);
    const monthsLeft = Math.ceil(
      (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
    );

    const update = await generateProgressUpdate({
      goalName: goal.name,
      targetAmount: goal.targetAmount,
      currentSaved: goal.currentSaved,
      progressPercent: goal.progressPercent,
      monthsLeft,
      monthlySurplus: surplus,
    });

    return res.status(200).json({ success: true, data: update });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    return res.status(200).json({ success: true, message: "Goal deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createGoal,
  getAllGoals,
  getGoalById,
  addSavingToGoal,
  getAIProgressUpdate,
  deleteGoal,
};