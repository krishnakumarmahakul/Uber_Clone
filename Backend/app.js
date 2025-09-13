const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
require('dotenv').config();
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapRoutes = require('./routes/map.routes');
const app = express();
app.use(cors(
    {
        origin: "http://localhost:5173",  
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true, 
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDb();


app.use("/users", userRoutes);
app.use("/captains",captainRoutes );
app.use('/map', mapRoutes);


app.get("/", (req, res) => {
    res.send("Hello World!");
});


module.exports = app;


