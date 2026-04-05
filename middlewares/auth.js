const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res,next) => {
    try {
        // first fetch token from request body
        const token = req.cookies.token || req.body.token ||
            req.header("Authorization").replace("Bearer ", "");

        // after validation check is this not currupted
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is Missing, means either your login is expired or unable to fetching token",
            });
        }
        try {
            // now decode your token if true so exicute it
            const decodeToken = await jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decodeToken)
            req.user = decodeToken;
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: "token is invalid",
            })
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: `Something Went Wrong While Validating the Token`,
        });
    }
}


exports.isViewer = async (req, res, next) => {
    try {
        if (req.user.role !== "Viewer") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Viewer",
            });
        }
        next();
    }
    catch {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};


exports.isAnalyst = async (req, res, next) => {
    try {
        if (req.user.role !== "Analyst") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Analyst",
            });
        }
        next();
    }
    catch {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Admin",
            });
        }
        next();
    }
    catch {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};

exports.allowSelfOrRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const requestedUserId = req.params.id || req.body.userId;

            if (allowedRoles.includes(req.user.role)) {
                return next();
            }

            if (req.user._id.toString() === requestedUserId) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: "Access denied: you can only access your own data"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization failed"
            });
        }
    };
};

exports.allowedRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied: Only ${roles.join(", ")} allowed`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "User role can't be verified"
            });
        }
    };
};
