import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    //personal data
    name : {type: String, required : true},
    email : {type: String, required : true, unique : true},
    password : {type: String, required : true},
   phoneNum : {type: Number , required : true},
    address: {type: String, required: true},
    dateOfBirth: {type: Date, required: true},
    avatar: { type: String, default: "" },

   //Role 
   role : {type: String,
            enum: ["admin", "teacher"],
            default: "teacher",
            required: true
   },

   // teacher expertise subject 
   subjects: {
    type: [String],
    default: []
  },

   // data for verification
   verifyOtp : {type: String, default: ''},
   verifyOtpExpireAt : {type: Number, default: 0},
   isAccountVerified : {type: Boolean, default: false},
   resetOtp : {type: String, default: ''},
   resetOtpExpireAt : {type: Number, default: 0},
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel; 