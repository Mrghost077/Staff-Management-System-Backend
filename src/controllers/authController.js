import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// Controller for Registering new User
export const register = async (req, res ) => {
    const {name , email, password, phoneNum, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.json ({success : false , message : "Missing Details "})

    }

    try {
        const existingUser = await userModel.findOne({email});

        if (existingUser){
            return res.json ({success: false, message: "User Already exists"});
        }
        // encrypting the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password: hashedPassword, phoneNum, role});
        await user.save();

        // Jwt token generate
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        // sending the token to user via cookie
        res.cookie ('token', token, {
            httpOnly : true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // sending account created email to the new register
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Teach Grid',
            text: `Hello ${name} !, Your teachGrid account has been successfully created. 
            your login details: [Email: ${email}, Password: ${password}]. 
            For your Security please sign in and change your password before using the system.
            
            If you did not request this account or believe this is a mistake, contact support at support@teachgrid.com.`
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true});
    }
    catch(error){
        res.json ({success: false, message: error.message})
    }
}

// Controller for signing in user
export const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password){
        return res.json ({success: false, message: "Email and Password are required"});
    }

    try{
        const user = await userModel.findOne({email});

        if (!user){
            return res.json({success: false, message: "Invalid email! User cannot be found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch){
            return res.json({success: false, message: "Invalid Password!"});
        }

        // Jwt token generate
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        // sending the token to user via cookie
        res.cookie ('token', token, {
            httpOnly : true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true, role: user.role});

    } catch(error) {
        return res.json ({success: false, message: error.message});
    }
}

// Controller for Logout
export const logout = async (req,res) => {
    try{
        res.clearCookie('token', {
            httpOnly : true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
        });

        return res.json({success: true, message: "Logged Out Successfully"})

    } catch (error){
        return res.json ({success: false, message: error.message});
    }
}

// sending verification OTP to the user
export const sendVerifyOtp = async (req,res) => {
    try {
        
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
           return res.json({success: false, message: 'user has been already verified'});
        }
        
        // Generating a 6 digit randon number
       const otp = String(Math.floor (100000 + Math.random() * 900000));

       // Adding the otp to the db
       user.verifyOtp = otp;
       user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
       await user.save();

        // Email for the user
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP to verify your account at TeachGrid is ${otp}
            
            If you did not request this account or believe this is a mistake, contact support at support@teachgrid.com.`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success: true, message: 'Verification email has been sent via email'})

    } catch (error) {
       return res.json({success: false , message: error.message});
    }
}

// verifying email controller
export const verifyEmail = async(req,res) =>{
    const {userId, otp} = req.body;
    if (!userId || !otp){
        return res.json({success: false, message: 'Mising details'});
    }

    try {
        const user = await userModel.findById(userId);

        if(!user){
           return res.json({success:false, message: 'Invalid User, User Not Found!'});
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp){
           return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.verifyOtpExpireAt < Date.now()){
           return res.json({success: false, message: 'OTP has expired!'});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

       return res.json({success: true, message: "User Email has been Successfully verified"})
        
    } catch (error) {
       return res.json({success: false, message: error.message});
    }
}

//controller to check if user is authenticated
export const isAuthenticated = async(req,res) => {
    try {
        // this will automatically work if there is token in cookie because i have connected the middleware 
        return res.json({success: true, message: "User is authenticated"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Controller to return authenticated user's profile
export const me = async (req, res) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.json({ success: false, message: 'User is not authenticated' })
    }

    const user = await userModel.findById(userId)

    if (!user) {
      return res.json({ success: false, message: 'User Not Found!' })
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNum: user.phoneNum,
        isAccountVerified: user.isAccountVerified
      }
    })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

// Controller to send reset pasword otp
export const sendResetOtp = async(req,res) =>{
    const {email} = req.body;

    if (!email){
        return res.json({success: false , message: "Email Missing"});
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: "User not Found!"});
        }

        // generate a random otp
        const otp = String(Math.floor(100000 + Math.random()*900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();
        
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: ` Use this OTP to reset your password : ${otp}, Note: this OTP expires is 15 min
            
            If you did not request this account or believe this is a mistake, contact support at support@teachgrid.com.`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success: true, message: "OTP sent to your email"});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Controller to reset password
export const resetPassword = async (req,res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: "Missing details "});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User not Found!"});
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.json ({success: false, message: "Invalid OTP!"});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false , message: "OTP Expired!"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: "Password has been reset successfully!"});
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}