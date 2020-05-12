
const express = require('express')
const app = express()
const cors = require('cors')


const logger = require('./utils/logger')
const Blog = require('./models/Blog')


app.use(cors())
app.use(express.json())

app.get('/api/blogs', (request, response, next) => {
    Blog
        .find({})
        .then(blogs => {
            response.json(blogs)
        })
        .catch(error => { next(error) })
})

app.post('/api/blogs', (request, response, next) => {
    const blog = new Blog(request.body)
    logger.info('Post:', blog)
    blog
        .save()
        .then(result => {
            response.status(201).json(result)
        })
        .catch(error => { next(error) })
})

const unknownEndpoint = (request, response) => {
    console.log('Unknown endpoint', request)
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    const errorResponce = (res, error) => {
        res.status(400)
        res.json({ error })
        res.end()
    }
    console.log('Error name', error.name)
    if (error.name === 'CastError') {
        return errorResponce(response, 'invalid id value')
    } else if (error.name === 'ValidationError') {
        return errorResponce(response, error.message)
    }
    next(error)
}

app.use(errorHandler)


module.exports = app
