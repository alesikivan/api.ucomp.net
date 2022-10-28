const { Schema, model } = require('mongoose')

const Collaboration = new Schema({
  title: { type: String, require: true },
  description: { type: String, require: true },
  dateCreate: { type: Date, default: new Date() },
  dateUpdate: { type: Date, default: new Date() },
})

module.exports = model('Collaboration', Collaboration)