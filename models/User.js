const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["Viewer", "Analyst", "Admin"],
        default: "Viewer",
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    image: {
        type: String,
        required: true,
    },
    recentActivity: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RecentActivity",
    }],
    financialRecord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FinancialRecord",
    },
    balance: {
        type: Number,
        default: 0,
        min: 0,
    }
},
{
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);