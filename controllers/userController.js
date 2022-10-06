const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const Role = require('../models/Role')
const User = require('../models/User')

const { getUserByToken } = require('../helpers/functions')
const { default: mongoose } = require('mongoose')

class UserController {
  
  async addGoogleUser ({ id, email, firstName, lastName, profilePhoto, fullName }) {
    try {
      const password = uuidv4()
      let hash = await bcrypt.hash(password, 7)

      const roles = await Role.findOne({ value: 'USER' })

      const user = new User({
        email, roles ,username: fullName, password: hash, profilePhoto, source: 'google'
      })

      return await user.save()
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: 'Server user functional error. Try to check your entries.' })
    }
  }

  async getResetData() {
    try {
      const resetToken = crypto.randomBytes(20).toString('hex')
  
      // Set token to `resetPasswordToken` field
      let resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    
      // Set expire
      let resetPasswordExpire = Date.now() + 10 * 60 * 1000
    
      return { resetToken, resetPasswordToken, resetPasswordExpire }
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: 'Server user functional error. Try to check your entries.' })
    }
  }
}

module.exports = new UserController()