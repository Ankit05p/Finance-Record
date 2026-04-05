const User = require("../models/User");


exports.getAllUsers = async (req,res) =>{
    try{
        const allUser = await User.find({},
            {
                firstName:true,
                lastName:true,
                role:true,
                status:true,
                image:true,
            }
        );
        return res.status(200).json({
            success:true,
            data:allUser,
        })
    }
    catch(error)
    {
        console.log(error);
        return res.status(404).json({
            success:false,
            message:"Can not fetch User data",
        })
    }
}

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const userDetails = await User.findById(userId)
            .select("firstName lastName email role status image recentActivity")
            .populate("recentActivity")
            .exec();

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: userDetails
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Can't fetch user data",
            error: error.message
        });
    }
};


exports.updateUser = async(req,res) => {
    try
    {
        const userId = req.params.id;
        const {firstName,lastName,role} = req.body;
        const updateUser = await User.findByIdAndUpdate(userId,{firstName,lastName,role},{new:true});
        if(!updateUser)
        {
            return res.status(404).json({
                success:false,
                message:"User not found by this id",
            })
        }
        return res.status(200).json({
            success:true,
            data:updateUser,
            message:"User updated",
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"error during updateUser",
        })
    }
}


exports.deleteUser = async(req,res) => {
    try
    {
        const userId = req.params.id;
        const deleteUser = await User.findByIdAndDelete(userId);
        if(!deleteUser)
        {
            return res.status(404).json({
                success:false,
                message:"error while deleting user",
            })
        }
        return res.status(200).json({
            success:true,
            message:"User deleted Successfully",
        })
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"user cant deleted",
        })
    }
}



