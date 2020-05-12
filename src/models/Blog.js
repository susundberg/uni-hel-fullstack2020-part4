
const mongoose = require('mongoose')
const config = require('../utils/config')

const DB_URL = config.MONGODB_URI


const blogSchema = mongoose.Schema({
    title: {
        type: String,
        minlength: 4,
        required: true
    },
    author: String,
    url: {
        type: String,
        minlength: 4,
        required: true
    },
    likes: { type: Number, default: 0 }
})
blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Blog = mongoose.model('Blog', blogSchema)

console.log(`Connecting to ${DB_URL}`)

mongoose.set('useFindAndModify', false)
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })


module.exports = Blog