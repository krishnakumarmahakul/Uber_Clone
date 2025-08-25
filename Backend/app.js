const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
require('dotenv').config();
const userRoutes = require('./routes/user.routes');

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


app.get("/", (req, res) => {
    res.send("Hello World!");
});


module.exports = app;


