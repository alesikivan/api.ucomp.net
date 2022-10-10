const { validationResult } = require('express-validator')
const { default: mongoose } = require('mongoose')

const { getUserByToken } = require('../helpers/functions')
const Member = require('../models/Member')
const { createImage, deleteImage } = require('../utils/images')

const memberFields = {
  name: 1,
  positions: 1,
  description: 1,
  dateCreate: 1,
  image: 1
}

class MemberController {
  async memberCreate(req, res) {
    try {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Invalid data', errors})
      }

      const { 
        name = '', 
        positions = [],
        image = '', // base64
      } = req.body

      const member = new Member({ 
        name, 
        positions,
      })

      // Check image exist
      if (image) {
        const imageName = createImage(member.id, image)

        if (imageName === 'invalid') 
          return res.status(400).json({ message: 'Invalid format. Please use png or jpeg format.' })

        member.image = `${process.env.SERVER_URL}/content/images/${imageName}`
      } else 
        member.image = ''

      await member.save()
      return res.json({ member, message: 'Member was successfully created!' })
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: 'Server member functional error. Try to check your entries.' })
    }
  }

  async getMembers(req, res) {
    try {
      const limit = 50
      const { skip = 0 } =  req.body

      const members = await Member
        .find({}, memberFields)
        .sort({ 'dateCreate': 1 }) 
        .skip(skip)
        .limit(limit)

      const membersAmount = await Member.count()

      return res.json({ members, limit, amount: membersAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server member functional error. Try to check your entries.'})
    }
  }

  async getMemberById(req, res) {
    try {
      const { id = 0 } =  req.params

      const member = await Member.findOne({ _id: id }, memberFields)

      if (!member) {
        return res.status(400).json({ message: `Can not find the member` })
      }

      return res.json(member)
    } catch (error) {
      console.log(error)
    }
  }

  async memberFinder(req, res) {
    try {
      const limit = 50
      const { skip = 0, name = '' } =  req.body

      if (!name) {
        const members = await Member
          .find({})
          .sort({ 'dateCreate': -1 }) 
          .skip(skip) 
          .limit(limit)
        
        const membersAmount = await Member
          .find({})
          .count()
        
        return res.status(200).json({ members, limit, amount: membersAmount })
      }

      const members = await Member
        .find({ 
          name: { $regex: new RegExp(name, 'i') } 
        })
        .sort({ 'dateCreate': -1 }) 
        .skip(skip) 
        .limit(limit)

      const membersAmount = await Member
        .find({ 
          name: { $regex: new RegExp(name, 'i') } 
        })
        .count()

      return res.status(200).json({ members, limit, amount: membersAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server member functional error. Try to check your entries.'})
    }
  }

  async updateMember(req, res) {
    try {
      const { 
        id = '',
        name = '',
        positions = [],
        description = '',
        image, // base64
        isDeleteImage = false
      } = req.body

      // Validate the ID format
      if (!mongoose.isValidObjectId(id)) {
        return res.status(403).json({ message: 'Not valid ID' })
      }

      const member = await Member.findOne({ _id: id })
  
      if (!member) return res.status(400).json({ message: `Can not find the member to update` })
  
      const updSet = { 
        name, 
        positions, 
        description, 
        dateUpdate: new Date()
      }

      if (isDeleteImage) {
        // Delete previos image
        const memberImage = member.image.split('/').slice(-1)[0]
        deleteImage(memberImage)

        updSet.image = ''
      }

      if (image && isDeleteImage === false) {
        if (member.image) {
          // Delete previos image
          const memberImage = member.image.split('/').slice(-1)[0]
          deleteImage(memberImage)
        }

        // Create a new image
        const imageName = createImage(member.id, image)

        if (imageName === 'invalid') 
          return res.status(400).json({ message: 'Invalid format. Please use png or jpeg format.' })

        updSet.image = `${process.env.SERVER_URL}/content/images/${imageName}`
      }


      const updMember = await Member.findOneAndUpdate(
        { _id: id },
        { $set: updSet },
        { new: true }
      )

      if (!updMember) {
        return res.status(403).json({ message: 'Member do not exist or you do not have access to update it' })
      }

      return res.status(200).json({ member: updMember, message: `Member successfully updated` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server member functional error. Try to check your entries.'})
    }
  }

  async deleteMember(req, res) {
    try {
      const { id = '' } =  req.params
  
      const member = await Member.findOne({ _id: id })
  
      if (!member) {
        return res.status(400).json({ message: `Can not find member to delete` })
      }
  
      // Get image name with extension
      const memberImage = member.image.split('/').slice(-1)[0]
  
      await Member.deleteOne({ _id: String(id) })

      if (member.image != '') deleteImage(memberImage)
  
      return res.status(200).json({ message: `Member successfully deleted` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server member functional error. Try to check your entries.'})
    }
  }
}

module.exports = new MemberController()