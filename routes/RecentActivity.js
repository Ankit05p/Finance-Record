const express = require("express");
const router = express.Router();

const{getAllRecentActivity,ActivityOfUserById} = require("../controller/RecentActivityService");
const { auth, isViewer, isAnalyst, isAdmin ,allowSelfOrRoles,allowedRoles} = require("../middlewares/auth");

router.get("/getAllRecentActivity",auth,getAllRecentActivity);
router.get("/ActivityOfUserById/:id",auth,allowSelfOrRoles("Analyst","Admin"),ActivityOfUserById);


module.exports = router;