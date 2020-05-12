
const express = require('express')
require('express-async-errors')

const app = express()
const cors = require('cors')


const logger = require('./utils/logger')
const Blog = require('./models/Blog')


app.use(cors())
app.use(express.json())

app.get('/api/blogs', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

app.get('/api/blogs/:id', async (request, response) => {
    const id = String(request.params.id)
    console.log('Find ID:', id)
    const blog = await Blog.findById(id)

    if (blog) {
        response.json(blog)
    }
    else {
        response.status(400).json({ 'error': 'not found' })
    }
})

app.post('/api/blogs', async (request, response) => {
    // logger.info('Create Post:', request.body)
    const blog = new Blog(request.body)
    logger.info('Create Post:', blog)
    const result = await blog.save()
    response.status(201).json(result)
})

app.put('/api/blogs/:id', async (request, response) => {
    const id = String(request.params.id)
    const blog = request.body

    console.log('Update ID:', id, blog )

    const newBlog = await Blog.findByIdAndUpdate( id, blog, { context: 'query', new: true, runValidators: true } )

    if (newBlog) {
        response.json(newBlog)
    }
    else {
        response.status(400).json({ 'error': 'not found' })
    }
})

app.delete('/api/blogs/:id', async (request, response) => {
    const id = String(request.params.id)
    console.log('Delete ID:', id)
    const blog = await Blog.findByIdAndRemove( id )

    if (blog) {
        response.json(blog)
    }
    else {
        response.status(400).json({ 'error': 'not found' })
    }
})


const unknownEndpoint = (request, response) => {
    // console.log('Unknown endpoint', request)
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    const errorResponce = (res, error) => {
        res.status(400)
        res.json({ error })
        res.end()
    }
    // console.log('Error name', error.name)
    if (error.name === 'CastError') {
        return errorResponce(response, 'invalid id value')
    } else if (error.name === 'ValidationError') {
        return errorResponce(response, error.message)
    }
    next(error)
}

app.use(errorHandler)


module.exports = app
