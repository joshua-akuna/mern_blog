const {Router} = require('express')
const router = Router()
const postController = require('../controllers/postController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', authMiddleware, postController.createPost)
router.get('/', postController.getAllPosts)
router.get('/:id', postController.getPostById)
router.get('/categories/:category', postController.getPostsByCategory)
router.get('/users/:id', postController.getPostsByUser)
router.patch('/:id', authMiddleware, postController.editPost)
router.delete('/:id',authMiddleware, postController.deletePostById)

module.exports = router
