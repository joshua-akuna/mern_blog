const {Router} = require('express')
const router = Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/change-avatar', authMiddleware, userController.changeAvatar)
router.patch('/edit-user', authMiddleware, userController.editUser)
router.get('/:id', userController.getUserById)
router.get('/', userController.getAllUsers)

module.exports = router
