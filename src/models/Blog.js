
const mongoose = require('mongoose')
const config   = require('../utils/config')

const DB_URL = config.MONGODB_URI


const blogSchema = mongoose.Schema({
    title:  {
        type: String,
        minlength: 4,
        required: true
    },
    author: String,
    url: String,
    likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)


mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })


module.exports = Blog