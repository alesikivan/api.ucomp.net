const Router = require('express')
const { check } = require('express-validator')

const controller = require('../controllers/collaborationController')

const authMiddleware = require('../middlewares/auth')

const router = new Router()

const validation = [
  check('title', 'Title of collaboration can not be empty').notEmpty().custom((value) => !!value.trim()),
  check('description', 'Description of publication can not be empty').notEmpty().custom((value) => !!value.trim()),
]

router.get('/get', controller.getCollaborations)

router.get('/get/:id', controller.getCollaborationById)

router.post('/create', authMiddleware, validation, controller.collaborationCreate)

router.put('/update', authMiddleware, validation, controller.updateCollaboration)

router.post('/finder', authMiddleware, controller.collaborationFinder)

router.delete('/delete/:id', authMiddleware, controller.deleteCollaboration)

module.exports = router