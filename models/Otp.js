const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default: Date.now,
        expires: 3600,
    },
});

async function sendVerificationEmail(email, otp) {
    try{
        // console.log("inside sendveridicationemail");
        const mailResponse = await mailSender(email, "Verification from Ankit", otp);
        // console.log(mailResponse);
    }
    catch(error) {
        console.log("error during mailsending");
        console.log(error);
    }
}

OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    // next();
})



module.exports = mongoose.model("OTP",OTPSchema);