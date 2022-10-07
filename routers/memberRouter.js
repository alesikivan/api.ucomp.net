const Router = require('express')
const { check } = require('express-validator')

const controller = require('../controllers/memberController')

const authMiddleware = require('../middlewares/auth')

const router = new Router()

router.get('/get', controller.getMembers)

router.get('/get/:id', controller.getMemberById)

router.post('/create', authMiddleware, [
  check('name', 'Name of member can not be empty').notEmpty().custom((value) => !!value.trim()),
], controller.memberCreate)

router.put('/update', authMiddleware, controller.updateMember)

router.post('/finder', authMiddleware, controller.memberFinder)

router.delete('/delete/:id', authMiddleware, controller.deleteMember)

module.exports = router