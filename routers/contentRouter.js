const fs = require('fs')
const { join } = require('path')
const Router = require('express')

const router = new Router()

router.get('/images/:id', (req, res) => {
  const { id = '' } = req.params

  const filePath = join(process.cwd(), 'content', 'client', 'images', id)

  fs.readFile(filePath, (err, data) => {
    if (err)
      res.status(400).send('Invalid request') 
    
    res.status(200).end(data)
  })
})

module.exports = router