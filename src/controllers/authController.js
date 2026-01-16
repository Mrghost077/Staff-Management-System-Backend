import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import sendEmail from "../config/nodemailer.js";

// Controller for Registering new User
export const register = async (req, res ) => {
    const {name , email, password, phoneNum, role, dateOfBirth, address, subjects} = req.body;

    if (!name || !email || !password || !role || !dateOfBirth || !address || (role.toLowerCase() === 'teacher' && (!subjects || subjects.length === 0))) {
        return res.json ({success : false , message : "Missing Details "})
    }

    try {
        const existingUser = await userModel.findOne({email});

        if (existingUser){
            return res.json ({success: false, message: "User Already exists"});
        }
        
        // encrypting the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name, 
            email, 
            password: hashedPassword, 
            phoneNum, 
            role, 
            dateOfBirth, 
            address, 
            subjects: (role.toLowerCase() === 'teacher' && subjects) ? subjects : []
        });
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
            subject: 'Welcome to TeachGrid! 🎉 Your Account is Ready',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to TeachGrid</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
                
                <div style="background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow: hidden; margin-bottom: 30px;">
                    
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                            👨‍🏫
                        </div>
                        <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to TeachGrid!</h1>
                        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 300;">Your account has been successfully created</p>
                    </div>

                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px;">Hello ${name}!</h2>
                        
                        <p style="color: #64748b; font-size: 16px; margin: 0 0 30px; line-height: 1.7;">
                            Your TeachGrid account is ready to use! We're excited to have you on board.
                        </p>

                        <div style="background: #f8fafc; border-radius: 16px; border-left: 4px solid #10b981; padding: 25px; margin: 0 0 30px;">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <div style="width: 40px; height: 40px; background: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                    <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                </div>
                                <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0;">Your Login Details</h3>
                            </div>
                            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 15px; align-items: center;">
                                    <span style="color: #64748b; font-weight: 500;">Email:</span>
                                    <code style="background: #f1f5f9; color: #1e293b; padding: 8px 12px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; font-weight: 600;">${email}</code>
                                </div>
                                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 15px; align-items: center; margin-top: 10px;">
                                    <span style="color: #64748b; font-weight: 500;">Password:</span>
                                    <code style="background: #fef3c7; color: #92400e; padding: 8px 12px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; font-weight: 600;">${password}</code>
                                </div>
                            </div>
                        </div>

                        <div style="background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                            <h4 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 10px; display: flex; align-items: center;">
                                🔒 Security Notice
                            </h4>
                            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                                For your security, please sign in and <strong>change your password</strong> immediately after first login.
                            </p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://teachgrid.com/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                                Sign In Now →
                            </a>
                        </div>

                        <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 14px; margin: 0 0 10px;">
                                Need help? Contact our support team:
                            </p>
                            <a href="mailto:support@teachgrid.com" style="color: #667eea; font-weight: 600; text-decoration: none; font-size: 16px;">
                                support@teachgrid.com
                            </a>
                        </div>
                    </div>

                    <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">
                            © 2026 TeachGrid. All rights reserved.<br>
                            <span style="font-size: 12px;">You received this email because your account was created on TeachGrid.</span>
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
            `.trim()
        };

        let emailWarning = null;

        try {
            await sendEmail(mailOptions);
        } catch (emailError) {
            console.error("Email Sending Failed:", emailError.message);
            emailWarning = `Account created, but the welcome email failed: ${emailError.message}`;
        }

        return res.json({
            success: true, 
            message: emailWarning || "Account created successfully and email sent.",
            emailSent: !emailWarning 
        });

    } catch(error){
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
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

       return res.json({
        success: true, 
        role: user.role, 
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAccountVerified: user.isAccountVerified
        }
    });

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