import users from "../models/users.js";
import bcrypt from 'bcrypt' 
import jwt from 'jsonwebtoken'
import validator from 'validator';
import { io } from "../server.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn : "7d"
    })
}

//Signup

export const signup = async (req ,res) => {
    try{
        const { username , email , password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message : "Please fill all fields"
            })
        }
        if (username.trim().length < 3) {
            return res.status(400).json({
                message : "Username must be at least 3 characters"
            })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message : "Invalid email address"
            })
        }
        if (!validator.isStrongPassword(password , {
            minLength : 6,
            minLowercase : 1,
            minUppercase : 1,
            minNumbers : 1,
            minSymbols : 0
        })) {
            return res.status(400).json({
                message : "Password must contain at least 6 characters , one uppercase letter , one lowercase letter and one number"
            })
        }
        const exists = await users.findOne({ email })
        if(exists) {
            return res.status(400).json({
                message : "Email a;ready exists"
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(password , salt) 

        const user = await users.create({
            username , email , password : hashPass
        })

        const token = createToken(user._id)

        io.emit("newUser", user);
        res.status(201).json({
            _id : user._id , 
            username : user.username ,
            email : user.email ,
            token
        })
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
}

// Login

export const login = async (req, res) => {
    try {
        const { email , password } = req.body

        const user = await users.findOne({ email })

        if(!user) {
            return res.status(400).json({
                message : "Invalid Credentials"
            })
        }
        const match = await bcrypt.compare(password , user.password)

        if(!match) {
            return res.status(400).json({
                message : "Invalid Credentials"
            })
        }

        const token = createToken(user._id)

        res.json({
            _id : user._id ,
            username : user.username , 
            email : user.email ,
            token
        })
    } catch (error) {
        res.status(500).json({
            message : error.message
        })
    }
}

