const { Schema, model } = require('mongoose')

const Publication = new Schema({
  title: { type: String, require: true },
  link: { type: String, default: '' },
  authors: { type: [String], default: [] },
  dateCreate: { type: Date, default: new Date() },
  dateUpdate: { type: Date, default: new Date() },
})

module.exports = model('Publication', Publication)