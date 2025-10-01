import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// Controller for Registering new User
export const register = async (req, res ) => {
    const {name , email, password, phoneNum} = req.body;

    if (!name || !email || !password) {
        return res.json ({success : false , message : "Missing Details "})

    }

    try {
        const existingUser = await userModel.findOne({email});

        if (existingUser){
            return res.json ({success: false, message: "User Already exists"});
        }
        // encrypting the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password: hashedPassword, phoneNum});
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

        return res.json({success: true});

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