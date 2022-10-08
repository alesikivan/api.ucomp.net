const { validationResult } = require('express-validator')
const { default: mongoose } = require('mongoose')

const Collaboration = require('../models/Collaboration')

const collaborationFields = {
  title: 1,
  description: 1,
  dateCreate: 1,
}

class CollaborationController {
  async collaborationCreate(req, res) {
    try {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Invalid data', errors})
      }

      const { 
        title = '', 
        description = ''
      } = req.body

      const collaboration = new Collaboration({ 
        title, 
        description
      })

      await collaboration.save()
      return res.json({ collaboration, message: 'Collaboration was successfully created!' })
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: 'Server collaboration functional error. Try to check your entries.' })
    }
  }

  async getCollaborations(req, res) {
    try {
      const limit = 50
      const { skip = 0 } =  req.body

      const collaborations = await Collaboration
        .find({}, collaborationFields)
        .sort({ 'dateCreate': -1 }) 
        .skip(skip)
        .limit(limit)

      const collaborationsAmount = await Collaboration.count()

      return res.json({ collaborations, limit, amount: collaborationsAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server collaboration functional error. Try to check your entries.'})
    }
  }

  async getCollaborationById(req, res) {
    try {
      const { id = 0 } =  req.params

      const collaboration = await Collaboration.findOne({ _id: id }, collaborationFields)

      if (!collaboration) {
        return res.status(400).json({ message: `Can not find the collaboration` })
      }

      return res.json(collaboration)
    } catch (error) {
      console.log(error)
    }
  }

  async collaborationFinder(req, res) {
    try {
      const limit = 50
      const { skip = 0, title = '' } =  req.body

      if (!title) {
        const collaborations = await Collaboration
          .find({})
          .sort({ 'dateCreate': -1 }) 
          .skip(skip) 
          .limit(limit)
        
        const collaborationsAmount = await Collaboration
          .find({ })
          .count()
        
        return res.status(200).json({ collaborations, limit, amount: collaborationsAmount })
      }

      const collaborations = await Collaboration
        .find({ 
          title: { $regex: new RegExp(title, 'i') } 
        })
        .sort({ 'dateCreate': -1 }) 
        .skip(skip) 
        .limit(limit)

      const collaborationsAmount = await Collaboration
        .find({ 
          title: { $regex: new RegExp(title, 'i') } 
        })
        .count()

      return res.status(200).json({ collaborations, limit, amount: collaborationsAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server collaboration functional error. Try to check your entries.'})
    }
  }

  async updateCollaboration(req, res) {
    try {
      const { 
        id = '',
        title = '',
        description = ''
      } = req.body

      // Validate the ID format
      if (!mongoose.isValidObjectId(id)) {
        return res.status(403).json({ message: 'Not valid ID' })
      }

      const collaboration = await Collaboration.findOne({ _id: id })
  
      if (!collaboration) return res.status(400).json({ message: `Can not find the collaboration to update` })

      const updSet = { 
        title, 
        description,
        dateUpdate: new Date()
      }

      const updCollaboration = await Collaboration.findOneAndUpdate(
        { _id: id },
        { $set: updSet },
        { new: true }
      )

      if (!updCollaboration) {
        return res.status(403).json({ message: 'Collaboration do not exist or you do not have access to update it' })
      }

      return res.status(200).json({ collaboration: updCollaboration, message: `Collaboration successfully updated` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server collaboration functional error. Try to check your entries.'})
    }
  }

  async deleteCollaboration(req, res) {
    try {
      const { id = '' } =  req.params
  
      const collaboration = await Collaboration.findOne({ _id: id })
  
      if (!collaboration) {
        return res.status(400).json({ message: `Can not find collaboration to delete` })
      }
  
      await Collaboration.deleteOne({ _id: String(id) })
  
      return res.status(200).json({ message: `Collaboration successfully deleted` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server collaboration functional error. Try to check your entries.'})
    }
  }
}

module.exports = new CollaborationController()