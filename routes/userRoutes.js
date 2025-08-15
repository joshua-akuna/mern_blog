const {Router} = require('express')
const router = Router()
const userController = require('../controllers/userController')

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/change-avatar', userController.changeAvatar)
router.patch('/edit-user', userController.editUser)
router.get('/:id', userController.getUserById)
router.get('/', userController.getAllUsers)

module.exports = router
