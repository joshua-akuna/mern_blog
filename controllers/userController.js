const HttpError = require("../models/errorModel")
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const {v4: uuid} = require('uuid')

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
        if(!req.files.avatar){
            return next(new HttpError('Choose a valid image', 422))
        }
        //create parent directory ifit doesn't exist
        !fs.existsSync(path.join(__dirname, '..', 'uploads')) && fs.mkdirSync(path.join(__dirname, '..', 'uploads'));
        // find user from db
        const user = await User.findById(req.user.id)
        //delete old avatar if it exists
        if (user.avatar){
            if(fs.existsSync(path.join(__dirname, '..', 'uploads', user.avatar))){
                fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err)=> {
                if (err){
                    return next(new HttpError(err))
                }})
            }
        }

        const {avatar} = req.files;
        // check file size
        if (avatar.size > 500000){
            return next(new HttpError('Picture should be less than 500kb', 422))
        }

        // rename files to avoid conflict
        let fileName
        fileName = avatar.name
        let splits = fileName.split('.')
        let newFileName = splits[0] + uuid() + '.' + splits[splits.length - 1]
        
        avatar.mv(path.join(__dirname, '..', 'uploads', newFileName), async(err) => {
            if (err){
                return next(new HttpError(err))
            }

            const updatedAvatar = await User.findByIdAndUpdate(req.user.id, {avatar: newFileName}, {new: true})
            if(!updatedAvatar){
                return next(new HttpError('Avatar could not be changed', 422))
            }
            res.status(200).json(updatedAvatar)
        })
    } catch (error) {
        return next(new HttpError(error))
    }
}






// ======== EDIT USER DETAILS (from profile) 
// POST: api/users/edit-user
// UNPROTECTED
module.exports.editUser = async (req, res, next)=>{
    try {
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        if (!name || !email || !currentPassword || !newPassword) {
            return next(new HttpError('Fill in all fields', 422))
        }

        // get user from db
        const user = await User.findById(req.user.id)
        if (!user){
            return next(HttpError('User not found', 403))
        }

        // ensure new email does not already exists
        const emailExists = await User.findOne({email})
        if (emailExists && (emailExists._id != req.user.id)){
            return next(new HttpError('Email does not belong to user', 422))
        }
        // compare current password
        const validateCurrentPassword = await bcrypt.compare(currentPassword, user.password)
        if(!validateCurrentPassword) {
            return next(new HttpError('Invalid current password', 422))
        }

        // confirm new passwords
        if (newPassword !== confirmNewPassword){
            return next(new HttpError('New passwords do not match', 422))
        }

        // hash new password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newPassword, salt)

        // update user info in db
        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password: hash}, {new: true})

        res.status(200).json(newInfo)
    } catch (error) {
        return next(new HttpError(error))
    }
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