
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../src/app')
const Blog = require('../src/models/Blog')

const testData = require('./test_data')
const testBlogs = testData.blogs

const api = supertest(app)
beforeEach(async () => {
    await Blog.deleteMany({})

    const blogobjs = testBlogs.map(x => new Blog(x))
    const promiseArray = blogobjs.map(x => x.save())
    await Promise.all(promiseArray)
})


afterAll(() => {
    mongoose.connection.close()
})

const get_and_check_json = async (url) => {
    const resblogsRaw = await api.get(url)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    return resblogsRaw.body
}

describe('Post methods', () => {

    const postBlog = async (content, expected) => {
        console.log('Creating:', content)
        if (expected === undefined)
            expected = 201

        const created = await api.post('/api/blogs')
            .send(content)
            .expect(expected)
            .expect('Content-Type', /application\/json/)
        return created.body
    }

    test('proper post creates new blog ', async () => {
        const resBef = await get_and_check_json('/api/blogs')
        const newBlog = testData.newBlogs[0]
        const createdBlog = await postBlog(newBlog)
        console.log('Created', createdBlog)
        expect(createdBlog.id).toBeDefined()

        for (let prop of ["title", "author", "url"]) {
            expect(createdBlog[prop]).toEqual(newBlog[prop])
        }

        const resAfter = await get_and_check_json('/api/blogs')
        expect(resAfter.length).toEqual(resBef.length + 1)
    })

    test('likes default to zero', async () => {
        let newBlog = testData.newBlogs[0]
        delete newBlog.likes
        const createdBlog = await postBlog(newBlog)
        expect(createdBlog.likes).toEqual(0)
    })

    test('gives error if title is missing', async () => {
        let newBlog = testData.newBlogs[0]
        delete newBlog.title
        const createdBlog = await postBlog(newBlog, 400)
        expect(createdBlog.error).toBeDefined()
    })
    test('gives error if url is missing', async () => {
        let newBlog = testData.newBlogs[0]
        delete newBlog.url
        const createdBlog = await postBlog(newBlog, 400)
        expect(createdBlog.error).toBeDefined()
    })
})

describe('Get methods', () => {
    test('blogs return json of proper size', async () => {
        const resblogs = await get_and_check_json('/api/blogs')
        expect(resblogs.length).toEqual(testBlogs.length)
    })

    test('blogs returns proper items', async () => {
        const resblogs = await get_and_check_json('/api/blogs')
        for (let b of resblogs) {
            expect(b.id).toBeDefined()
            expect(b.author).toBeDefined()
            expect(b.title).toBeDefined()
            expect(b.likes).toBeDefined()
        }
    })

    test('proper error with invalid id ', async () => {
        const res = await api.get('/api/blogs/12345')
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(res.body.error).toBeDefined()
        console.log(' res.body.error', res.body.error)
    })
})

describe('Delete methods', () => {

    test('proper delete works', async () => {
        const resBef = await get_and_check_json('/api/blogs')
        await api.delete('/api/blogs/' + resBef[1].id)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const resAfter = await get_and_check_json('/api/blogs')
        expect(resBef.length - 1).toEqual(resAfter.length)
    })

    test('invalid id gives error', async () => {
        const res = await api.delete('/api/blogs/deadbeef')
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(res.body.error).toBeDefined()
    })
})



describe('Update methods', () => {

    const updateBlog = async (content, expected) => {
        console.log('Update:', content)
        if (expected === undefined)
            expected = 200

        const created = await api.put('/api/blogs/' + content.id)
            .send(content)
            .expect(expected)
            .expect('Content-Type', /application\/json/)
        return created.body
    }

    test('proper update works', async () => {
        const resBef = await get_and_check_json('/api/blogs')
        const updated = resBef[0]
        updated.likes += 100

        const resNew = await updateBlog(updated)
        expect(resNew.id).toEqual( updated.id )
        expect(resNew.likes).toEqual( updated.likes )
    })

    test('invalid id gives error', async () => {
        const res = await updateBlog( { id:"deadbeef"}, 400 )
        expect(res.error).toBeDefined()
    })

    test('invalid content gives error', async () => {
        const resBef = await get_and_check_json('/api/blogs')
        const updated = resBef[0]
        updated.title = ""
        const res = await updateBlog( updated, 400 )
        expect(res.error).toBeDefined()
    })
})
