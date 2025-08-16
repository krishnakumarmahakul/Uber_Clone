const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema=new mongoose.Schema({
    fullname:{
        firstname:{
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long'],
        },
        lastname:{
            type: String,
            
        }},
        email:{
            type: String,
            required: true,
            unique: true,
            match: /.+\@.+\..+/,

        },
        password:{
            type: String,
            required: true,
            select: false

        
        },
        socketId:{
            type: String,
            
        },

    }
)

userSchema.methods.generateAuthToken = function () {
    const token=jwt.sign({_id:this._id},process.env.JWT_SECRET, {
        expiresIn: '10h'
    });
    return token;

}
userSchema.statics.hashPassword=async function (password) {
    const salt= await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);

}
userSchema.methods.comparePassword=async function (password) {
    return await bcrypt.compare(password, this.password);



}

const userModel=mongoose.model('User', userSchema);
module.exports = userModel;
