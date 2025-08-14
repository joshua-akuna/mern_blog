// ========REGISTER A NEW USER
// POST: api/users/register
// UNPROTECTED
module.exports.registerUser = async (req, res, next)=>{
    res.send('Register User')
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