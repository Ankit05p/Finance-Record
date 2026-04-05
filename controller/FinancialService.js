const User = require("../models/User");
const FinancialRecord = require("../models/FinancialRecord");
const Category = require("../models/Category");
const RecentActivity = require("../models/RecentActivity");


exports.createFinancialRecore = async (req, res) => {
    try {
        const { userId, amount, type, category, notes } = req.body;

        if (!userId || !amount || !type || !category) {
            return res.status(400).json({
                success: false,
                message: "Please enter valid data"
            });
        }

        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // category check
        const categoryFound = await Category.findOne({
            categoryName: category
        });

        if (!categoryFound) {
            return res.status(404).json({
                success: false,
                message: "Create category first than create finance"
            });
        }

        // balance update
        let totalAmount = userDetails.balance;

        if (type === "income") {
            totalAmount += amount;
        } else {
            totalAmount -= amount;
        }
        
        // console.log("total amount", totalAmount);

        // create record
        const createFinance = await FinancialRecord.create({
            user: userId,
            amount,
            type,
            category: categoryFound._id,
            notes
        });

        // console.log("after createing finance");

        // create activity
        const createActivity = await RecentActivity.create({
            user: userId,
            type,
            CategoryType: categoryFound._id,
            description: notes
        });

        // console.log("after create Recene");

        // update user
        const userUpdate = await User.findByIdAndUpdate(
            userId,
            {
                financialRecore: createFinance._id,
                balance: totalAmount,
                $push: { recentActivity: createActivity._id }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            data: createFinance
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "error while creating finance record",
        })
    }
}


exports.getAllFinanceRecore = async (req, res) => {
    try {
        const allFinanceRecord = await FinancialRecord.find({})
            .populate("user")
            .populate("category"); // ✔ fixed

        console.log("allFinanceRecord", allFinanceRecord);

        if (allFinanceRecord.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No finance record found",
            });
        }

        return res.status(200).json({
            success: true,
            data: allFinanceRecord
        });

    } catch (error) {
        console.error(error); // 🔥 important for debugging
        return res.status(500).json({
            success: false,
            message: "error while fetching finance record",
        });
    }
};


exports.getFinanceByUserId = async (req, res) => {
    try {
        const userId = req.params.id;
        const userFinanceRecore = await FinancialRecord.findOne({ user: userId });
        if (!userFinanceRecore) {
            return res.status(404).json({
                success: false,
                message: "error find detail for this user",
            })
        }
        return res.status(200).json({
            success: true,
            data: userFinanceRecore,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "server error while fetching financialdetails",
        })
    }
}


exports.updateFinancialRecore = async (req, res) => {
    try {
        const { userId, financeId, amount, type, category, notes } = req.body;

        if (!userId || !amount || !type || !category || !financeId) {
            return res.status(400).json({
                success: false,
                message: "Please enter valid data"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const oldRecord = await FinancialRecord.findById(financeId);
        if (!oldRecord) {
            return res.status(404).json({
                success: false,
                message: "Record not found"
            });
        }

        const categoryFound = await Category.findOne({ categoryName: category });

        if (!categoryFound) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        let balance = user.balance;

        if (oldRecord.type === "income") {
            balance -= oldRecord.amount;
        } else {
            balance += oldRecord.amount;
        }

        if (type === "income") {
            balance += amount;
        } else {
            balance -= amount;
        }

        const updatedRecord = await FinancialRecord.findByIdAndUpdate(
            financeId,
            {
                amount,
                type,
                category: [categoryFound._id], // ✔ fix
                notes
            },
            { new: true }
        );

        const activity = await RecentActivity.create({
            user: userId,
            type,
            CategoryType: categoryFound._id, // ✔ fix
            description: "Updated record"
        });

        await User.findByIdAndUpdate(userId, {
            balance: balance, // ✔ fix
            $push: { recentActivity: activity._id }
        });

        return res.status(200).json({
            success: true,
            data: updatedRecord
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Update failed",
            error: error.message
        });
    }
};



exports.deleteFinancialRecord = async (req, res) => {
    try {
        const { userId, financeId } = req.body;

        // validation
        if (!userId || !financeId) {
            return res.status(400).json({
                success: false,
                message: "Please provide userId and financeId"
            });
        }

        // check user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // check record
        const record = await FinancialRecord.findById(financeId);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Record not found"
            });
        }

        // 🔥 security check
        if (record.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // 🔥 balance adjustment (reverse effect)
        let balance = user.balance;

        if (record.type === "income") {
            balance -= record.amount;
        } else {
            balance += record.amount;
        }

        // delete record
        await FinancialRecord.findByIdAndDelete(financeId);

        // update user balance
        await User.findByIdAndUpdate(userId, { balance });

        // 🔥 create activity
        const activity = await RecentActivity.create({
            user: userId,
            type: record.type,
            CategoryType: record.category,
            description: "Deleted financial record"
        });

        // push activity
        await User.findByIdAndUpdate(userId, {
            $push: { recentActivity: activity._id }
        });

        return res.status(200).json({
            success: true,
            message: "Record deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Delete failed",
            error: error.message
        });
    }
};



