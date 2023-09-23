const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    name:String,
    email:String,
    password:String,
    role: {
        type: String,
        required: true,
        enum: ["User", "Admin"],
        default: "User",
      }
},{versionKey:false})

const userModel=mongoose.model("user",userSchema)

module.exports={
    userModel
}