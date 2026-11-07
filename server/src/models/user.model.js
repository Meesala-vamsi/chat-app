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
    }
},{timestamps: true})

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return 

    try{
        console.log("🚀 ~ this.password:", this.password)
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
        console.log("🚀 ~ checkPassword:", checkPassword)
        return checkPassword;
    }catch(error){
        return false
    }
}

const User = mongoose.model("User", userSchema);

module.exports = User