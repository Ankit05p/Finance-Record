const RecentActivity = require("../models/RecentActivity");
const User = require("../models/User");


exports.getAllRecentActivity = async (req,res) => {
    try{
        const allActivity = await RecentActivity.find({})
        .populate("user")
        .populate("CategoryType")
        .exec();
        return res.status(200).json({
            success:true,
            data:allActivity,
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"Interanl server error",
            error:error.message,
        })
    }
}




exports.ActivityOfUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId is required"
            });
        }

        // check user
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User is invalid"
            });
        }

        // 🔥 fetch activity
        const activities = await RecentActivity.find({ user: userId })
            .populate("CategoryType") // category details
            .sort({ createdAt: -1 }) // latest first
            .limit(10); // optional

        return res.status(200).json({
            success: true,
            count: activities.length,
            data: activities
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
            error: error.message
        });
    }
};

