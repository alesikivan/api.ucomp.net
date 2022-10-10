const Router = require('express')
const { check } = require('express-validator')

const controller = require('../controllers/publicationController')

const authMiddleware = require('../middlewares/auth')

const router = new Router()

const validation = [
  check('title', 'Title of publication can not be empty').notEmpty().custom((value) => !!value.trim()),
  check('year', 'Year of publication can not be empty').notEmpty(),
  check('year', 'Year should be a number').isNumeric()
]

router.get('/get', controller.getPublications)

router.get('/get/:id', controller.getPublicationById)

router.post('/create', authMiddleware, validation, controller.publicationCreate)

router.put('/update', authMiddleware, validation, controller.updatePublication)

router.post('/finder', authMiddleware, controller.publicationFinder)

router.delete('/delete/:id', authMiddleware, controller.deletePublication)

module.exports = router