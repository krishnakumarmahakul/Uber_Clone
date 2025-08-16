const mongoose = require('mongoose');


const connectDb=()=>{
    mongoose.connect(process.env.MONGO_URL,)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    });

}

module.exports=connectDb;
