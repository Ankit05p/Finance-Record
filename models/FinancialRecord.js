const mongoose = require("mongoose");

const financialRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    type: {
        type: String,
        enum: ["income", "expense"],
        required: true,
    },
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    }],
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, "Max 500 characters allowed"],
    }
},
{
    timestamps: true,
});

module.exports = mongoose.model("FinancialRecord", financialRecordSchema);