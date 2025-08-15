const HttpError = require("../models/errorModel")
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



// ========REGISTER A NEW USER
// POST: api/users/register
// UNPROTECTED
module.exports.registerUser = async (req, res, next)=>{
    try {
        const {name, email, password, confirmPassword} = req.body;
        
        if(!name || !email || !password){
            return next(new HttpError('Fill in all fields.', 422))
        }

        const emailExists = await User.findOne({email})
        
        if(emailExists){
            return next(new HttpError('Email already exists', 422))
        }
        
        if ((password.trim()).length < 6){
            return next(new HttpError('Passwords should be at least 6 characters long', 422))
        }

        if (password != confirmPassword){
            return next(new HttpError('Passwords do not match.', 422))
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = await User.create({name, email, password: hashedPassword})
        res.status(201).json(`New user ${newUser.email} registered`)
    } catch (error) {
        return next(new HttpError('User registration failed.', 422))
    }
}




 
// ========LOGIN A REGISTERED USER
// POST: api/users/login
// UNPROTECTED
module.exports.loginUser = async (req, res, next)=>{
    try {
        const { email, password } = req.body;
        
        if(!email || !password) {
            return next(new HttpError('Fill in all fields', 422))
        }
        const user = await User.findOne({email})
        if(!user){
            return next(new HttpError('Email not found', 422))
        }
        const comparePass = await bcrypt.compare(password, user.password)
        if (!comparePass){
            return next(new HttpError('Wrong password', 422))
        }
        const {_id: id, name} = user;
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})
        res.status(200).json({token, id, name})
    } catch (error) {
        return next(new HttpError('Login failed. Please check credentials, 422'))        
    }
}




// ======== USER PROFILE
// GET: api/users/:id
// PROTECTED
module.exports.getUserById = async (req, res, next)=>{
    try {
        const {id} = req.params;
        const user = await User.findById(id).select('-password')
        if (!user){
            return next(new HttpError('User not found', 404))
        }
        res.status(200).json(user)
    } catch (error) {
        return next(new HttpError('User not found', 404))
    }
}






// ======== CHANGE USER AVATAR (display picture)
// POST: api/users/change-avatar
// PROTECTED
module.exports.changeAvatar = async (req, res, next)=>{
    try {
        console.log(req.files);
        res.json(req.files)
    } catch (error) {
        return next(new HttpError(error))
    }
}






// ======== EDIT USER DETAILS (from profile)
// POST: api/users/edit-user
// UNPROTECTED
module.exports.editUser = async (req, res, next)=>{
    res.send('Edit User Profile')
}

 





// ======== GET AUTHORS
// POST: api/users/
// PROTECTED
module.exports.getAllUsers = async (req, res, next)=>{
    try {
         const users = await User.find().select('-password')
         res.json(users)
    } catch (error) {
        return next(new HttpError(error))
    }
} 