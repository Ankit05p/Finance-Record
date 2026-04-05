const Category = require("../models/Category");
const User = require("../models/User");

exports.createCategory = async (req, res) => {
    try {
        const { userId, categoryName, description, type } = req.body;
        if (!userId || !categoryName || !type) {
            return res.status(404).json({
                success: false,
                message: "please enter all neccasy thing",
            })
        }
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "this user is not registerd",
            })
        }

        const createCatetory = await Category.create({ categoryName, description, type });
        return res.status(200).json({
            success: true,
            data: createCatetory,
            message: "category created successfully",
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "category crated failed ",
            error: error.message,
        })
    }
}



exports.showAllCategory = async (req, res) => {
    try {
        const allCategories = await Category.find({})
        .populate("user").exec();
        return res.status(200).json({
            success: true,
            data: allCategories,
            message: "successfully find category",
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.categoryPageDetails = async (req, res) => {
    try {
        const categoryId  = req.params.id;
        const categoryDetail = await Category.findById(categoryId)
            .populate("user").exec();

        if (!categoryDetail) {
            return res.status(404).json({
                success: false,
                message: "category not found for that user",
            })
        }
        return res.status(200).json({
            success: true,
            data: categoryDetail,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}
