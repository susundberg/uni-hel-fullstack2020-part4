
const supertest = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User')
const Blog = require('../src/models/Blog')
const api = supertest(app)
const testData = require('./test_data')

const postLogin = async (content, expected) => {
    console.log('Login:', content)
    if (expected === undefined)
        expected = 200

    const created = await api.post('/api/login')
        .send(content)
        .expect(expected)
        .expect('Content-Type', /application\/json/)

    return created.body
}

const initDBUsers = async () => {

    await User.deleteMany({})

    const users = testData.users.map(x => new User(x))
    const promises = users.map(x => x.save())
    await Promise.all(promises)
}

const clearDBBlogs = async () => {

    await Blog.deleteMany({})
}


const initDBBlogs = async () => {

    await Blog.deleteMany({})

    const users = await User.find({})

    const blogobjs = testData.blogs.map((x, index) => {
        x.user = users[index % 2]
        return new Blog(x)
    })

    const promiseArray = blogobjs.map(x => x.save())
    await Promise.all(promiseArray)

}
module.exports = { postLogin, initDBUsers, initDBBlogs, clearDBBlogs }