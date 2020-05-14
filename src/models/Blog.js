
const mongoose = require('mongoose')
const database = require('./database')

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
    likes: { type: Number, default: 0 },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})


blogSchema.set('toJSON', { transform: database.toJSON  })

const Blog = mongoose.model('Blog', blogSchema)


module.exports = Blog