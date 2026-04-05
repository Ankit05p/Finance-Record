const express = require("express");
const router = express.Router();


const {createFinancialRecore,getAllFinanceRecore,getFinanceByUserId,updateFinancialRecore,deleteFinancialRecord} = require("../controller/FinancialService");
const { auth, isViewer, isAnalyst, isAdmin ,allowSelfOrRoles,allowedRoles} = require("../middlewares/auth");

router.post("/createFinancialRecore",auth,allowSelfOrRoles("Analyst","Admin"),createFinancialRecore);
router.get("/getAllFinanceRecore",auth,allowedRoles("Analyst","Admin"),getAllFinanceRecore);
router.get("/getFinanceByUserId/:id",auth,allowSelfOrRoles("Analyst","Admin"),getFinanceByUserId);
router.post("/updateFinancialRecore",auth,allowSelfOrRoles("Analyst","Admin"),updateFinancialRecore);
router.post("/deleteFinancialRecord",auth,allowSelfOrRoles("Analyst","Admin"),deleteFinancialRecord);


module.exports = router;