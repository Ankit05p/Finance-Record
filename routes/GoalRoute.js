const express = require("express");
require("dotenv").config();
const router = express.Router();

const {
  createGoal,
  getAllGoals,
  getGoalById,
  addSavingToGoal,
  getAIProgressUpdate,
  deleteGoal,
} = require("../controller/GoalService.js");

const { auth } = require("../middlewares/auth");

// const router = express.Router();

// router.use(auth); // sab routes protected hain

router.post("/createGoal", auth,createGoal);
router.get("/getAllGoals",auth, getAllGoals);
router.get("/getGoalById/:id",auth, getGoalById);
// router.patch("/addSavingToGoal/:id/save", auth,addSavingToGoal);
router.get("/getProgress/:id/progress", auth,getAIProgressUpdate);
router.delete("/deleteGoal/:id",auth, deleteGoal);

module.exports = router;