const { validationResult } = require('express-validator')
const { default: mongoose } = require('mongoose')

const Publication = require('../models/Publication')

const publicationFields = {
  title: 1,
  link: 1,
  journal: 1,
  year: 1,
  authors: 1,
  dateCreate: 1,
};

// (async function(){
//   await Publication.updateMany({}, { $set: { journal: '' } });
// })();

class PublicationController {
  async publicationCreate(req, res) {
    try {
      const errors = validationResult(req)
      
      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Invalid data', errors})
      }

      const { 
        title = '', 
        link = '',
        journal = '',
        year = new Date().getFullYear(),
        authors = []
      } = req.body

      const publication = new Publication({ 
        title, 
        link,
        year,
        authors,
        journal
      })

      await publication.save()
      return res.json({ publication, message: 'Publication was successfully created!' })
    } catch (error) {
      console.log(error)
      return res.status(400).json({ message: 'Server publication functional error. Try to check your entries.' })
    }
  }

  async getPublications(req, res) {
    try {
      const limit = 50
      const { skip = 0 } =  req.body

      const publications = await Publication
        .find({}, publicationFields)
        .sort({ 'year': -1 }) 
        .skip(skip)
        .limit(limit)

      const publicationsAmount = await Publication.count()

      return res.json({ publications, limit, amount: publicationsAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server publication functional error. Try to check your entries.'})
    }
  }

  async getPublicationById(req, res) {
    try {
      const { id = 0 } =  req.params

      const publication = await Publication.findOne({ _id: id }, publicationFields)

      if (!publication) {
        return res.status(400).json({ message: `Can not find the publication` })
      }

      return res.json(publication)
    } catch (error) {
      console.log(error)
    }
  }

  async publicationFinder(req, res) {
    try {
      const limit = 50
      const { skip = 0, title = '' } =  req.body

      if (!title) {
        const publications = await Publication
          .find({})
          .sort({ 'year': -1 }) 
          .skip(skip) 
          .limit(limit)
        
        const publicationsAmount = await Publication
          .find({ })
          .count()
        
        return res.status(200).json({ publications, limit, amount: publicationsAmount })
      }

      const publications = await Publication
        .find({ 
          title: { $regex: new RegExp(title, 'i') } 
        })
        .sort({ 'year': -1 }) 
        .skip(skip) 
        .limit(limit)

      const publicationsAmount = await Publication
        .find({ 
          title: { $regex: new RegExp(title, 'i') } 
        })
        .count()

      return res.status(200).json({ publications, limit, amount: publicationsAmount })
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server publication functional error. Try to check your entries.'})
    }
  }

  async updatePublication(req, res) {
    try {
      const { 
        id = '',
        title = '',
        year = 2000,
        link = '',
        journal = '',
        authors = []
      } = req.body

      // Validate the ID format
      if (!mongoose.isValidObjectId(id)) {
        return res.status(403).json({ message: 'Not valid ID' })
      }

      const publication = await Publication.findOne({ _id: id })
  
      if (!publication) return res.status(400).json({ message: `Can not find the publication to update` })

      const updSet = { 
        title, 
        link, 
        year, 
        authors,
        journal,
        dateUpdate: new Date(),
      }

      const updPublication = await Publication.findOneAndUpdate(
        { _id: id },
        { $set: updSet },
        { new: true }
      )

      if (!updPublication) {
        return res.status(403).json({ message: 'Publication do not exist or you do not have access to update it' })
      }

      return res.status(200).json({ publication: updPublication, message: `Publication successfully updated` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server publication functional error. Try to check your entries.'})
    }
  }

  async deletePublication(req, res) {
    try {
      const { id = '' } =  req.params
  
      const publication = await Publication.findOne({ _id: id })
  
      if (!publication) {
        return res.status(400).json({ message: `Can not find publication to delete` })
      }
  
      await Publication.deleteOne({ _id: String(id) })
  
      return res.status(200).json({ message: `Publication successfully deleted` }) 
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: 'Server publication functional error. Try to check your entries.'})
    }
  }
}

module.exports = new PublicationController()