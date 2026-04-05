const mongoose = require("mongoose");
const Category = require("./Category");

const recentActivitySchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    type:{
        type:String,
        enum:["income","expense"],
        required:true,
    },
    CategoryType:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    },
    description:{
        type:String,
        default:"for persnal use",
    }
});

module.exports = mongoose.model("RecentActivity", recentActivitySchema);

