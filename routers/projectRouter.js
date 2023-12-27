const Router = require('express')
const { check } = require('express-validator')

const controller = require('../controllers/projectsController')

const authMiddleware = require('../middlewares/auth')

const router = new Router()

router.get('/get', controller.getProjects)

router.get('/get/:id', controller.getProjectById)

router.post('/create', authMiddleware, [
  check('title', 'Title of project can not be empty').notEmpty().custom((value) => !!value.trim()),
], controller.projectCreate)

router.put('/update', authMiddleware, controller.updateProject)

router.post('/finder', authMiddleware, controller.projectFinder)

router.delete('/delete/:id', authMiddleware, controller.deleteProject)

module.exports = router