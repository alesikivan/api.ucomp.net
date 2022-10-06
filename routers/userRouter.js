const Router = require('express')

const controller = require('../controllers/userController')

const authMiddleware = require('../middlewares/auth')

const router = new Router()

// router.get('/get/:id', authMiddleware, controller.getUser)

module.exports = router