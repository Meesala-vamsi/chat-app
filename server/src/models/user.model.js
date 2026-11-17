const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: [true, "First name is required"]
    },
    lastName: {
        type:String,
        required: [true, "Last name is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        min: [3, "Password should contain atleast 4 characters."]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    avatar: {
        type: String,
        default: ""
    },
    about: {
        type: String,
        default: "",
        maxlength: [200, "About can have up to 200 characters."]
    },
    designation: {
        type: String,
        default: "",
        maxlength: [80, "Designation can have up to 80 characters."]
    },
    lastSeen: {
        type: Date,
        default: null
    }
},{timestamps: true})

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return 

    try{
        const encryptPassword = await bcrypt.hash(this.password, 10);
        this.password = encryptPassword
        // next();
    }catch(error){
        return error
    }
})

userSchema.methods.comparePasswords = async function(userPassword, hashPassword){
    try{
        const checkPassword = await bcrypt.compare(userPassword, hashPassword);
        return checkPassword;
    }catch(error){
        return false
    }
}

const User = mongoose.model("User", userSchema);

module.exports = User