
const express = require('express')
require('express-async-errors')

const app = express()
const cors = require('cors')


const logger = require('./utils/logger')
const token  = require('./middleware/token' )


app.use(cors())
app.use(express.json())
app.use( token.tokenExtractor )

const usersRouter = require('./controllers/users')
const blogsRouter  = require('./controllers/blog')
const loginRouter  = require('./controllers/login')

app.use('/api/users', usersRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/login', loginRouter)

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
    
    console.log('Error', error.name, error.message )

    if (error.name === 'CastError') {
        return errorResponce(response, 'invalid id value')
    } else if (error.name === 'ValidationError') {
        return errorResponce(response, error.message)
    }
    else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'invalid token' })
    }


    logger.error(error.message)

    next(error)
}

app.use(errorHandler)


module.exports = app
