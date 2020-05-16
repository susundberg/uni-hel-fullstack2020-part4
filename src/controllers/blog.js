const blogRouter = require('express').Router()
const logger = require('../utils/logger')
const Blog = require('../models/Blog')
const tokens = require('../middleware/token')


blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
    const id = String(request.params.id)
    console.log('Find ID:', id)
    const blog = await Blog.findById(id).populate('user', { username: 1, name: 1 })

    if (blog) {
        response.json(blog)
    }
    else {
        response.status(400).json({ 'error': 'not found' })
    }
})



blogRouter.post('/', async (request, response) => {
    const user = await tokens.verifyToken(request, response)
    if (!user)
        return // errorcode is sent at verify

    request.body.user = user._id    
    const blog = new Blog(request.body)
    blog.populate('user', { username: 1, name: 1 }).execPopulate() 
    const result = await blog.save()
    logger.info("Blog save done", result )
    
    user.blogs.concat( blog._id )
    await user.save()

    response.status(201).json(result)
})

blogRouter.put('/:id', async (request, response) => {

    const id = String(request.params.id)
    const blog = request.body

    console.log("Update ID", id, blog )
    const newBlog = await Blog.findByIdAndUpdate(id, blog, { context: 'query', new: true, runValidators: true })

    if (newBlog) {
        response.json(newBlog)
    }
    else {
        console.error("Update failed:", blog )
        response.status(400).json({ 'error': 'not found' })
    }
})

blogRouter.delete('/:id', async (request, response) => {
    const id = String(request.params.id)
    console.log('Delete ID:', id)

    const user = await tokens.verifyToken(request, response)
    if (!user)
        return // errorcode is sent at verify
    
    const blog = await Blog.findById(id)
    if ( !blog ) {
        response.status(400).json({ 'error': 'not found' })
        return 
    }

    console.log("Check delete", blog.user.toString(), user._id )

    if ( blog.user.toString() !== user._id.toString() ) {
        response.status(401).json({ 'error': 'not owner' })
        return 
    }

    await blog.remove()

    response.json(blog)
})


module.exports = blogRouter
