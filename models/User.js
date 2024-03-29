const { Schema, model } = require('mongoose');

const User = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, unique: true, required: true},
  roles: {type: [String], ref: 'Role', default: []},
  dateCreate: {type: Date, default: new Date()},
  dateUpdate: {type: Date, default: new Date()},
  profilePhoto: {type: String},
  source: {type: String, default: 'bookmark.red'},
  resetPasswordToken: {type: String},
  resetPasswordExpire: {type: String},
})

module.exports = model('User', User)
