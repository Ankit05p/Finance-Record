const express = require("express");
const router = express.Router();

const {createCategory,showAllCategory,categoryPageDetails} = require("../controller/CategoryService");
const { auth, isViewer, isAnalyst, isAdmin ,allowSelfOrRoles,allowedRoles} = require("../middlewares/auth");

router.post("/createCategory",auth,allowedRoles("Analyst","Admin"),createCategory);
router.get("/showAllCategory",auth,showAllCategory);
router.get("/categoryPageDetails/:id",auth,categoryPageDetails);


module.exports = router;