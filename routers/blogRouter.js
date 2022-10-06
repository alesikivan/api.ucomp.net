const Router = require('express')
const { check } = require('express-validator')

const controller = require('../controllers/blogController')

const authMiddleware = require('../middlewares/auth')

const router = new Router()

router.get('/get', controller.getBlogs)

router.get('/get/:id', controller.getBlogsByUserId)

router.post('/create', authMiddleware, [
  check('title', 'Title of blog can not be empty').notEmpty().custom((value) => !!value.trim()),
], controller.blogCreate)

router.put('/update', authMiddleware, controller.updateBlog)

router.post('/finder', authMiddleware, controller.blogFinder)

router.delete('/delete/:id', authMiddleware, controller.deleteBlog)

module.exports = router