const express = require("express");
const router = express.Router();

// fetching controller
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controller/UserService");
const { sendotp, signup, login, changePassword, logout } = require("../controller/Auth");
const { auth, isViewer, isAnalyst, isAdmin ,allowSelfOrRoles} = require("../middlewares/auth");


// create routes for
// Routes Releted user registration
router.post("/sendotp", sendotp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/changePassword", auth, changePassword);
router.post("/logout", auth, logout);

// Routes Releted user detail fetchings
router.get("/getAllUsers", auth, getAllUsers);
router.get("/getUserById/:id", auth,allowSelfOrRoles("Admin", "Analyst"),getUserById);
router.put("/updateUser/:id",auth,allowSelfOrRoles("Admin", "Analyst"),updateUser);
router.delete("/deleteUser/:id",auth,allowSelfOrRoles("Admin", "Analyst"),deleteUser);



module.exports = router;