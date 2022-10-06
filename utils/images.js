const fs = require('fs')
const { join } = require('path')

const getFilePath = file => join(process.cwd(), 'content', 'client', 'images', file)

const createImage = (fileName, base64) => {
  let base64Image = base64.split(';base64,').pop()

  const ext = getExtension(base64)

  if (!['png', 'jpeg'].includes(ext)) return 'invalid'

  fileName = `${fileName}.${ext}`

  const filePath = getFilePath(fileName)
  
  fs.writeFile(
    filePath, 
    base64Image, 
    { encoding: 'base64' }, 
    err => console.log('File created successfully'))

  return fileName
}

const deleteImage = (fileName) => {
  const filePath = getFilePath(fileName)

  fs.stat(filePath, (err, stats) => {
    if (err) return console.error(err);
 
    fs.unlink(filePath, err => {
      if(err) return console.log(err)
      console.log('File deleted successfully')
    })  
 })
}

function getExtension(base64) {
  const [data] = base64.split(';')
  const [other, ext = ''] = data.split('/')
  
  return ext
}


module.exports = { createImage, deleteImage }