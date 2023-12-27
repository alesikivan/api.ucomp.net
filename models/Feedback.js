const { Schema, model } = require('mongoose')

const Feedback = new Schema({
  email: { type: String, require: true },
  message: { type: String, require: true },
  dateCreate: { type: Date, default: new Date() },
  dateUpdate: { type: Date, default: new Date() },
})

module.exports = model('Feedback', Feedback)