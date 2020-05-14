const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')

usersRouter.post('/', async (request, response) => {
    const body = request.body

    const saltRounds = 10
    const password = await bcrypt.hash(body.password, saltRounds)

    if ( body.password.length < 8 ) {
        return response.status(400).json({ 'error':'too weak password' } )
    }

    const user = new User({
        username: body.username,
        name: body.name,
        password,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})


usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { url: 1, title: 1, author:1 })
    response.json(users)
})

module.exports = usersRouter