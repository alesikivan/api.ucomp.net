const { validationResult } = require('express-validator')
const { default: mongoose } = require('mongoose')

const Feedback = require('../models/Feedback')

const feedbackFields = {
  email: 1,
  message: 1,
  dateCreate: 1,
}

class FeedbackController {
  async feedbackCreate(req, res) {
    try {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Invalid data', errors})
      }

      const { 
        email = '', 
        message = ''
      } = req.body

      const feedback = new Feedback({ 
        email, 
        message
      })

      await feedback.save()
      return res.json({ feedback, message: 'Feedback was successfully created! Thank you!' })
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: 'Server feedback functional error. Try to check your entries.' })
    }
  }

  async getFeedbacks(req, res) {
    try {
      const limit = 50
      const { skip = 0 } =  req.body

      const feedbacks = await Feedback
        .find({}, feedbackFields)
        .sort({ 'dateCreate': -1 }) 
        .skip(skip)
        .limit(limit)

      const feedbacksAmount = await Feedback.count()

      return res.json({ feedbacks, limit, amount: feedbacksAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server feedback functional error. Try to check your entries.'})
    }
  }

  async getFeedbackById(req, res) {
    try {
      const { id = 0 } =  req.params

      const feedback = await Feedback.findOne({ _id: id }, feedbackFields)

      if (!feedback) {
        return res.status(400).json({ message: `Can not find the feedback` })
      }

      return res.json(feedback)
    } catch (error) {
      console.log(error)
    }
  }

  async feedbackFinder(req, res) {
    try {
      const limit = 50
      const { skip = 0, email = '' } =  req.body

      if (!title) {
        const feedbacks = await Feedback
          .find({})
          .sort({ 'dateCreate': -1 }) 
          .skip(skip) 
          .limit(limit)
        
        const feedbacksAmount = await Feedback
          .find({ })
          .count()
        
        return res.status(200).json({ feedbacks, limit, amount: feedbacksAmount })
      }

      const feedbacks = await Feedback
        .find({ 
          email: { $regex: new RegExp(email, 'i') } 
        })
        .sort({ 'dateCreate': -1 }) 
        .skip(skip) 
        .limit(limit)

      const feedbacksAmount = await Feedback
        .find({ 
          email: { $regex: new RegExp(email, 'i') } 
        })
        .count()

      return res.status(200).json({ feedbacks, limit, amount: feedbacksAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server feedback functional error. Try to check your entries.'})
    }
  }

  async updateFeedback(req, res) {
    try {
      const { 
        id = '',
        email = '',
        message = ''
      } = req.body

      // Validate the ID format
      if (!mongoose.isValidObjectId(id)) {
        return res.status(403).json({ message: 'Not valid ID' })
      }

      const feedback = await Feedback.findOne({ _id: id })
  
      if (!feedback) return res.status(400).json({ message: `Can not find the feedback to update` })

      const updSet = { 
        email, 
        message,
        dateUpdate: new Date()
      }

      const updFeedback = await Feedback.findOneAndUpdate(
        { _id: id },
        { $set: updSet },
        { new: true }
      )

      if (!updFeedback) {
        return res.status(403).json({ message: 'Feedback do not exist or you do not have access to update it' })
      }

      return res.status(200).json({ feedback: updFeedback, message: `Feedback successfully updated` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server feedback functional error. Try to check your entries.'})
    }
  }

  async deleteFeedback(req, res) {
    try {
      const { id = '' } =  req.params
  
      const feedback = await Feedback.findOne({ _id: id })
  
      if (!feedback) {
        return res.status(400).json({ message: `Can not find feedback to delete` })
      }
  
      await Feedback.deleteOne({ _id: String(id) })
  
      return res.status(200).json({ message: `Feedback successfully deleted` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server feedback functional error. Try to check your entries.'})
    }
  }
}

module.exports = new FeedbackController()