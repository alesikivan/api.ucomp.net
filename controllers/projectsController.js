const { validationResult } = require('express-validator')
const { default: mongoose } = require('mongoose')

const { getUserByToken } = require('../helpers/functions')
const Project = require('../models/Project')
const { createImage, deleteImage } = require('../utils/images')

const projectFields = {
  title: 1,
  link: 1,
  content: 1,
  dateCreate: 1,
  developers: 1,
  image: 1
}

class ProjectController {
  async projectCreate(req, res) {
    try {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Invalid data', errors})
      }

      const user = getUserByToken(req.headers.authorization)

      const { 
        title = '', 
        link = '', 
        content = '',
        image = '', // base64,
        developers = []
      } = req.body

      const project = new Project({ 
        title, 
        link: link.endsWith('/') ? link.slice(0, -1) : link, 
        content,
        developers,
        author: user.id
      })

      // Check image exist
      if (image) {
        const imageName = createImage(project.id, image)

        if (imageName === 'invalid') 
          return res.status(400).json({ message: 'Invalid format. Please use png or jpeg format.' })

        project.image = `${process.env.SERVER_URL}/content/images/${imageName}`
      } else 
        project.image = ''

      await project.save()
      return res.json({ project, message: 'Project was successfully created!' })
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: 'Server project functional error. Try to check your entries.' })
    }
  }

  async getProjects(req, res) {
    try {
      const limit = 50
      const { skip = 0 } =  req.body

      const projects = await Project
        .find({}, projectFields)
        .sort({ 'dateCreate': -1 }) 
        .skip(skip)
        .limit(limit)

      const projectsAmount = await Project.count()

      return res.json({ projects, limit, amount: projectsAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server project functional error. Try to check your entries.'})
    }
  }

  async getProjectById(req, res) {
    try {
      const { id = 0 } =  req.params

      const project = await Project.findOne({ _id: id }, projectFields)

      if (!project) {
        return res.status(400).json({ message: `Can not find the project` })
      }

      let next = await Project
        .findOne({ 
          _id: { $gt: mongoose.Types.ObjectId(project.id)}
        })
        .sort({ _id: 1 })
        .limit(1)

      let previos = await Project
        .findOne({ 
          _id: { $lt: mongoose.Types.ObjectId(project.id)}
        })
        .sort({ _id: -1 })
        .limit(1)

      next = next ? next._id : null
      previos = previos ? previos._id : null

      return res.json({ project, next, previos })
    } catch (error) {
      console.log(error)
    }
  }

  async projectFinder(req, res) {
    try {
      const user = getUserByToken(req.headers.authorization)

      const limit = 50
      const { skip = 0, title = '' } =  req.body

      if (!title) {
        const projects = await Project
          .find({ author: user.id })
          .sort({ 'dateCreate': -1 }) 
          .skip(skip) 
          .limit(limit)
        
        const projectsAmount = await Project
          .find({ author: user.id })
          .count()
        
        return res.status(200).json({ projects, limit, amount: projectsAmount })
      }

      const projects = await Project
        .find({ 
          author: user.id, 
          title: { $regex: new RegExp(title, 'i') } 
        })
        .sort({ 'dateCreate': -1 }) 
        .skip(skip) 
        .limit(limit)

      const projectsAmount = await Project
        .find({ 
          author: user.id, 
          title: { $regex: new RegExp(title, 'i') } 
        })
        .count()

      return res.status(200).json({ projects, limit, amount: projectsAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server project functional error. Try to check your entries.'})
    }
  }

  async updateProject(req, res) {
    try {
      const user = getUserByToken(req.headers.authorization)

      const { 
        id = '',
        title = '',
        link = '',
        content = '',
        developers = [],
        image, // base64
        isDeleteImage = false,
        isModifiedImage = false
      } = req.body

      // Validate the ID format
      if (!mongoose.isValidObjectId(id)) {
        return res.status(403).json({ message: 'Not valid ID' })
      }

      const project = await Project.findOne({ _id: id, author: user.id })
  
      if (!project) return res.status(400).json({ message: `Can not find the project to update` })
  
      if (user.id !== String(project.author)) {
        return res.status(400).json({ message: `You do not have access to update it` })
      }

      const updSet = { 
        title, 
        link: link.endsWith('/') ? link.slice(0, -1) : link, 
        content, 
        developers,
        dateUpdate: new Date()
      }

      if (isModifiedImage) {
        // Image has been removed
        if (isDeleteImage) {
          // Delete previos image
          const projectImage = project.image.split('/').slice(-1)[0]
          deleteImage(projectImage)

          updSet.image = ''
        }

        // Loaded new image
        if (image && isDeleteImage === false) {
          if (project.image) {
            // Delete previos image
            const projectImage = project.image.split('/').slice(-1)[0]
            deleteImage(projectImage)
          }

          // Create a new image
          const imageName = createImage(project.id, image)

          if (imageName === 'invalid') 
            return res.status(400).json({ message: 'Invalid format. Please use png or jpeg format.' })

          updSet.image = `${process.env.SERVER_URL}/content/images/${imageName}`
        }
      }

      const updProject = await Project.findOneAndUpdate(
        { 
          _id: id,
          author: user.id
        },
        { $set: updSet },
        { new: true }
      )

      if (!updProject) {
        return res.status(403).json({ message: 'Project do not exist or you do not have access to update it' })
      }

      return res.status(200).json({ project: updProject, message: `Project successfully updated` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server project functional error. Try to check your entries.'})
    }
  }

  async deleteProject(req, res) {
    try {
      const user = getUserByToken(req.headers.authorization)

      const { id = '' } =  req.params
  
      const project = await Project.findOne({ _id: id })
  
      if (!project) {
        return res.status(400).json({ message: `Can not find project to delete` })
      }
  
      if (user.id !== String(project.author)) {
        return res.status(400).json({ message: `You do not have access to delete it` })
      }

      // Get image name with extension
      const projectImage = project.image.split('/').slice(-1)[0]
  
      await Project.deleteOne({ _id: String(id) })

      if (project.image != '') deleteImage(projectImage)
  
      return res.status(200).json({ message: `Project successfully deleted` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server project functional error. Try to check your entries.'})
    }
  }
}

module.exports = new ProjectController()