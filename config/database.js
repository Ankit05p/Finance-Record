const mongoose = require("mongoose");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;

exports.dbconnect = () => {
    mongoose.connect(DATABASE_URL)
    .then(() => console.log("DB connected Successfully"))
    .catch((err)=> {
        console.log("DB connection Failed");
        console.error(err.message);
        process.exit(1);
    });
};