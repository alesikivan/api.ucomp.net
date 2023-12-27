const { Schema, model } = require('mongoose')

const Project = new Schema({
  title: {type: String, require: true},
  link: {type: String, require: true},
  content: {type: String, require: true},
  image: {type: String},
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  developers: { type: [String], default: [] },
  dateCreate: {type: Date, default: new Date()},
  dateUpdate: {type: Date, default: new Date()},
})

module.exports = model('Project', Project)