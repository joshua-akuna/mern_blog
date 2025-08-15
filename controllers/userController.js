// ========REGISTER A NEW USER
// POST: api/users/register

const HttpError = require("../models/errorModel")
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

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
        res.status(201).json(newUser)
        
    } catch (error) {
        return next(new HttpError('User registration failed.', 422))
    }
}




 
// ========LOGIN A REGISTERED USER
// POST: api/users/login
// UNPROTECTED
module.exports.loginUser = async (req, res, next)=>{
    res.send('login registered User')
}




// ======== USER PROFILE
// GET: api/users/:id
// PROTECTED
module.exports.getUserById = async (req, res, next)=>{
    res.send('Get User')
}






// ======== CHANGE USER AVATAR (display picture)
// POST: api/users/change-avatar
// PROTECTED
module.exports.changeAvatar = async (req, res, next)=>{
    res.send('Change User Avatar')
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
    res.send('All Users')
} 