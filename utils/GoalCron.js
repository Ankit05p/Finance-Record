const cron = require("node-cron");
const Goal = require("../models/Goal");
require("dotenv").config();

const startGoalCron = () => {
  cron.schedule("0 9 1 * *", async () => {
    console.log("Goal cron running — checking all active goals...");

    const activeGoals = await Goal.find({ status: "active" }).populate(
      "user",
      "currentBalance"
    );

    for (const goal of activeGoals) {
      try {
        const monthsLeft = Math.ceil(
          (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
        );

        if (monthsLeft <= 0 && goal.currentSaved < goal.targetAmount) {
          goal.status = "failed";
          await goal.save();
          continue;
        }

        goal.progressPercent = Math.min(
          Math.round((goal.currentSaved / goal.targetAmount) * 100),
          100
        );
        goal.lastChecked = new Date();
        await goal.save();

        console.log(`Updated goal: ${goal.name} — ${goal.progressPercent}%`);
      } catch (err) {
        console.error(`Cron error for goal ${goal._id}:`, err.message);
      }
    }
  });

  console.log("Goal cron scheduler started");
};

module.exports = { startGoalCron };