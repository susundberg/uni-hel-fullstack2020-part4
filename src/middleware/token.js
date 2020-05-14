
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const config = require('../utils/config')

const verifyToken = async ( request, response ) => {
    console.log('Verify token', request.token)
    const decoded = jwt.verify(request.token, config.TOKEN_SECRET)

    if ( !request.token || !decoded.id ) {
        response.status(401).json({ error: 'token missing or invalid' })
        return null
    }
    return await User.findById(decoded.id)
}

const tokenExtractor = (request, response, next) => {
    // code that extracts the token

    const authorization = request.get('authorization')
    // console.log('Auth', authorization )
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) 
    {
        request.token = authorization.substring(7)
    }
    next()
}

module.exports = { tokenExtractor, verifyToken  }