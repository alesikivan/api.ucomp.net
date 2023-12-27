const { validationResult } = require('express-validator')
const { default: mongoose } = require('mongoose')

const { getUserByToken } = require('../helpers/functions')
const Blog = require('../models/Blog')
const { createImage, deleteImage } = require('../utils/images')

const blogFields = {
  title: 1,
  content: 1,
  dateCreate: 1,
  image: 1
}

class BlogController {
  async blogCreate(req, res) {
    try {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Invalid data', errors})
      }

      const user = getUserByToken(req.headers.authorization)

      const { 
        title = '', 
        content = '',
        image = '', // base64
      } = req.body

      const blog = new Blog({ 
        title, 
        content,
        author: user.id
      })

      // Check image exist
      if (image) {
        const imageName = createImage(blog.id, image)

        if (imageName === 'invalid') 
          return res.status(400).json({ message: 'Invalid format. Please use png or jpeg format.' })

        blog.image = `${process.env.SERVER_URL}/content/images/${imageName}`
      } else 
        blog.image = ''

      await blog.save()
      return res.json({ blog, message: 'Blog was successfully created!' })
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: 'Server blog functional error. Try to check your entries.' })
    }
  }

  async getBlogs(req, res) {
    try {
      const limit = 50
      const { skip = 0 } =  req.body

      const blogs = await Blog
        .find({}, blogFields)
        .sort({ 'dateCreate': -1 }) 
        .skip(skip)
        .limit(limit)

      const blogsAmount = await Blog.count()

      return res.json({ blogs, limit, amount: blogsAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server blog functional error. Try to check your entries.'})
    }
  }

  async getBlogById(req, res) {
    try {
      const { id = 0 } =  req.params

      const blog = await Blog.findOne({ _id: id }, blogFields)

      if (!blog) {
        return res.status(400).json({ message: `Can not find the blog` })
      }

      let next = await Blog
        .findOne({ 
          _id: { $gt: mongoose.Types.ObjectId(blog.id)}
        })
        .sort({ _id: 1 })
        .limit(1)

      let previos = await Blog
        .findOne({ 
          _id: { $lt: mongoose.Types.ObjectId(blog.id)}
        })
        .sort({ _id: -1 })
        .limit(1)

      next = next ? next._id : null
      previos = previos ? previos._id : null

      return res.json({ blog, next, previos })
    } catch (error) {
      console.log(error)
    }
  }

  async blogFinder(req, res) {
    try {
      const user = getUserByToken(req.headers.authorization)

      const limit = 50
      const { skip = 0, title = '' } =  req.body

      if (!title) {
        const blogs = await Blog
          .find({ author: user.id })
          .sort({ 'dateCreate': -1 }) 
          .skip(skip) 
          .limit(limit)
        
        const blogsAmount = await Blog
          .find({ author: user.id })
          .count()
        
        return res.status(200).json({ blogs, limit, amount: blogsAmount })
      }

      const blogs = await Blog
        .find({ 
          author: user.id, 
          title: { $regex: new RegExp(title, 'i') } 
        })
        .sort({ 'dateCreate': -1 }) 
        .skip(skip) 
        .limit(limit)

      const blogsAmount = await Blog
        .find({ 
          author: user.id, 
          title: { $regex: new RegExp(title, 'i') } 
        })
        .count()

      return res.status(200).json({ blogs, limit, amount: blogsAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server blog functional error. Try to check your entries.'})
    }
  }

  async updateBlog(req, res) {
    try {
      const user = getUserByToken(req.headers.authorization)

      const { 
        id = '',
        title = '',
        content = '',
        image, // base64
        isDeleteImage = false,
        isModifiedImage = false
      } = req.body

      // Validate the ID format
      if (!mongoose.isValidObjectId(id)) {
        return res.status(403).json({ message: 'Not valid ID' })
      }

      const blog = await Blog.findOne({ _id: id, author: user.id })
  
      if (!blog) return res.status(400).json({ message: `Can not find the blog to update` })
  
      if (user.id !== String(blog.author)) {
        return res.status(400).json({ message: `You do not have access to update it` })
      }

      const updSet = { 
        title, 
        content, 
        dateUpdate: new Date()
      }

      if (isModifiedImage) {
        // Image has been removed
        if (isDeleteImage) {
          // Delete previos image
          const blogImage = blog.image.split('/').slice(-1)[0]
          deleteImage(blogImage)

          updSet.image = ''
        }

        // Loaded new image
        if (image && isDeleteImage === false) {
          if (blog.image) {
            // Delete previos image
            const blogImage = blog.image.split('/').slice(-1)[0]
            deleteImage(blogImage)
          }

          // Create a new image
          const imageName = createImage(blog.id, image)

          if (imageName === 'invalid') 
            return res.status(400).json({ message: 'Invalid format. Please use png or jpeg format.' })

          updSet.image = `${process.env.SERVER_URL}/content/images/${imageName}`
        }
      }

      const updBlog = await Blog.findOneAndUpdate(
        { 
          _id: id,
          author: user.id
        },
        { $set: updSet },
        { new: true }
      )

      if (!updBlog) {
        return res.status(403).json({ message: 'Blog do not exist or you do not have access to update it' })
      }

      return res.status(200).json({ blog: updBlog, message: `Blog successfully updated` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server blog functional error. Try to check your entries.'})
    }
  }

  async deleteBlog(req, res) {
    try {
      const user = getUserByToken(req.headers.authorization)

      const { id = '' } =  req.params
  
      const blog = await Blog.findOne({ _id: id })
  
      if (!blog) {
        return res.status(400).json({ message: `Can not find blog to delete` })
      }
  
      if (user.id !== String(blog.author)) {
        return res.status(400).json({ message: `You do not have access to delete it` })
      }

      // Get image name with extension
      const blogImage = blog.image.split('/').slice(-1)[0]
  
      await Blog.deleteOne({ _id: String(id) })

      if (blog.image != '') deleteImage(blogImage)
  
      return res.status(200).json({ message: `Blog successfully deleted` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server blog functional error. Try to check your entries.'})
    }
  }
}

module.exports = new BlogController()