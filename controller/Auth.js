const User = require("../models/User");
const OTP = require("../models/Otp");
const mailSender = require("../utils/mailSender");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.sendotp = async (req, res) => {
    try {
        const { email } = req.body;
        // for checking if user is already present 
        // find user with procided email
        // console.log(email);
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: `Otp has send`,
            })
        }
        // console.log("before otp");
        // next we generate a otp for singup
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        // console.log("otp genere successf");
        let result = await OTP.findOne({ otp });
        // otp validation
        // console.log("before generating otp");
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp });
        }
        // console.log("otp is " ,otp);

        // Ab OTP ki OTP model mai entry create kar do
        // console.log("before save");
        const otpBody = await OTP.create({ email, otp });
        // console.log("otp saved");
        res.status(200).json({
            success: true,
            otp,
            message: `otp Sent Succesfully`,
            otpBody,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword,
            role, otp
        } = req.body;
        // Some validation for user 
        if (!firstName || !lastName || !email || !password || !confirmPassword || !role || !otp) {
            return res.status(403).json({
                success: false,
                message: "All field are required",
            });
        }
        if (password !== confirmPassword) {
            return res.status(430).json({
                success: false,
                message: "password and confirm passwoed dont match"
            })
        }
        // for checking existing of user
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({
                success: false,
                message: "user already exist",
            })
        }

        // if nahi hai so create it
        const response = await OTP.findOne({ email }).sort({ createdAt: -1 });
        if (!response) {
            return res.status(400).json({
                success: false,
                message: "The otp is not valid",
            });
        }

        if (otp !== response.otp) {
            return res.status(400).json({
                success: false,
                message: "The otp is not valid",
            });
        }
        // now hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // now save user detail
        const user = await User.create({
            firstName, lastName, email,
            password: hashedPassword,
            role: role,
            status: "active",
            image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
        });
        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User cant be reg, please try again",
        })
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: `Please Fill up All the required Field`,
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: `user is not registered, first you should register`,
            })
        }
        // now check password is correct or not
        if (await bcrypt.compare(password, user.password)) {
            // if password correct hai so token send karo jisse baar baar user ko login na karna pade
            const payload = {
                email: user.email,
                id: user._id,
                role: user.role,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,
                {
                    expiresIn: "48h",
                }
            );
            // console.log("before create user to object");
            // user = user.toObject();
            user.token = token;
            user.password = undefined;

            console.log("before options");
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            console.log("before sending cookies");

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: `User Login success`,
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: `Password is incorrect,please enter right password`,
            })
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        })
    }
}

// there have a some mestake in this code
exports.changePassword = async (req, res) => {
    try {
        // if user is changing our password that meaning user is login means token is present
        // and during token we stored some detail
        // const userId = req.body.id;

        const { userId, oldPassword, newPassword, } = req.body;
        // console.log("userId is ",userId);
        const userDetails = await User.findOne({ _id: userId });
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // chane oldPassword than  encrypt newpassword and save
        console.log("after usrdetails",userDetails.password);
        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "the password is incorrect given by user",
            })
        }
        // console.log("before hasing password");
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(userId, {
            password: hashedPassword
        },
            { new: true });
    }
    catch (error) {
        console.error("Error occurred while updating password:", error)
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        })
    }
}


exports.logout = async (req, res) => {
    try {
        res.clearCookie("token");

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
}


