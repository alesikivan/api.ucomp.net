const { Schema, model } = require('mongoose')

const Blog = new Schema({
  title: {type: String, require: true},
  content: {type: String, require: true},
  image: {type: String},
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  dateCreate: {type: Date, default: new Date()},
  dateUpdate: {type: Date, default: new Date()},
})

module.exports = model('Blog', Blog)