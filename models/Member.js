const { Schema, model } = require('mongoose');

const Member = new Schema({
  name: {type: String, required: true},
  positions: {type: [String], default: []},
  description: {type: String, default: ''},
  dateCreate: {type: Date, default: new Date()},
  dateUpdate: {type: Date, default: new Date()},
  image: {type: String}
})

module.exports = model('Member', Member)
