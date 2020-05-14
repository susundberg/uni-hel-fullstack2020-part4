const mongoose = require('mongoose')
const config = require('../utils/config')

const DB_URL = config.MONGODB_URI

mongoose.set('useFindAndModify', false)
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const toJSON = (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
}

module.exports = { toJSON } 
