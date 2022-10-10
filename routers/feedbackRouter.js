const Router = require('express')
const { check } = require('express-validator')

const controller = require('../controllers/feedbackController')

const authMiddleware = require('../middlewares/auth')

const router = new Router()

const validation = [
  check('email', 'Email of feedback can not be empty').notEmpty().custom((value) => !!value.trim()),
  check('email').isEmail(),
  check('message', 'Message of publication can not be empty').notEmpty().custom((value) => !!value.trim()),
]

router.get('/get', controller.getFeedbacks)

router.get('/get/:id', controller.getFeedbackById)

router.post('/create', validation, controller.feedbackCreate)

router.put('/update', authMiddleware, validation, controller.updateFeedback)

router.post('/finder', authMiddleware, controller.feedbackFinder)

router.delete('/delete/:id', authMiddleware, controller.deleteFeedback)

module.exports = router