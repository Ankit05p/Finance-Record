const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const dbconnect = require("./config/database");

const Userroutes = require("./routes/UserRoute");
const CategoryRoutes = require("./routes/CategoryRoute");
const FinancilaRoutes = require("./routes/FinancialRoute");
const RecentRoutes = require("./routes/RecentActivity");
const goalRoutes = require("./routes/GoalRoute.js");
const {startGoalCron} = require("./utils/GoalCron.js");
const stockRoutes = require('./routes/StockRoute');



const PORT = process.env.PORT || 4000;
dbconnect.dbconnect();
// startGoalCron();
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth",Userroutes);
app.use("/api/v1/category",CategoryRoutes);
app.use("/api/v1/finance",FinancilaRoutes);
app.use("/api/v1/recent",RecentRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use('/api/v1/stocks', stockRoutes);

app.get("/",(req,res) => 
{
    return res.json({
        success:true,
        message:"your server is up and running"
    })
})

app.listen(PORT,()=>
{
    console.log(`App is running at ${PORT}`);
})

