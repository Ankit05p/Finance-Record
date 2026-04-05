const mongoose = require("mongoose");

// this is example of some category  like 'salary', 'freelance', 'investment', 'rental',   // income categories
// 'food', 'rent', 'utilities', 'transport',         // expense categories
// 'healthcare', 'education', 'entertainment',
// 'shopping', 'insurance', 'tax', 'other',

const CategorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        enum:["income","expense"],
        required:true,
    },
    user:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }]
});

module.exports = mongoose.model("Category",CategorySchema);