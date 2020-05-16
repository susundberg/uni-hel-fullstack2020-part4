
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../src/app')


const testData = require('./test_data')
const testHelp = require('./test_helpers')

const testBlogs = testData.blogs



const login = async () => {
    const user = testData.users[0]
    const res = await testHelp.postLogin({ username: user.username, password: user.passwordPlain })
    expect(res.token).toBeDefined()
    return res.token
}

const get_and_check_json = async (url) => {
    const resblogsRaw = await api.get(url)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    return resblogsRaw.body
}

let TOKEN = ""
let AUTH_TOKEN = ""
const api = supertest(app)

beforeAll(async () => {
    await testHelp.initDBUsers()
})


beforeEach(async () => {
    await testHelp.initDBBlogs()


    TOKEN = await login()
    AUTH_TOKEN = "bearer " + TOKEN
})


afterAll(() => {
    mongoose.connection.close()
})



describe('Post methods', () => {

    const postBlog = async (content, expected, no_auth) => {


        const token = (no_auth === true) ? undefined : AUTH_TOKEN

        console.log('Creating:', content, expected, token)
        const req = api.post('/api/blogs')

        if (token)
            req.set('Authorization', token)

        req.send(content)
            .expect(expected)
            .expect('Content-Type', /application\/json/)

        const created = await req
        return created.body
    }

    test('unauthorized cannot create', async () => {
        const newBlog = testData.newBlogs[0]
        const res = await postBlog(newBlog, 401, true)
        expect(res.error).toBeDefined()

    })

    test('proper post creates new blog ', async () => {
        const resBef = await get_and_check_json('/api/blogs')


        const newBlog = testData.newBlogs[0]
        const createdBlog = await postBlog(newBlog, 201)
        console.log('Created', createdBlog)
        expect(createdBlog.id).toBeDefined()

        for (let prop of ["title", "author", "url"]) {
            expect(createdBlog[prop]).toEqual(newBlog[prop])
        }
        expect(createdBlog.user).toBeDefined()
        console.log( "Created blog user:", createdBlog.user )
        expect(createdBlog.user.username).toEqual("test1")



        const resAfter = await get_and_check_json('/api/blogs')
        expect(resAfter.length).toEqual(resBef.length + 1)
    })

    test('likes default to zero', async () => {

        let newBlog = testData.newBlogs[0]
        delete newBlog.likes
        const createdBlog = await postBlog(newBlog, 201)
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
    test('return json of proper size', async () => {
        const resblogs = await get_and_check_json('/api/blogs')
        expect(resblogs.length).toEqual(testBlogs.length)
    })

    test('returns proper items', async () => {

        const resblogs = await get_and_check_json('/api/blogs')
        expect(resblogs).toBeDefined()
        expect(resblogs.length).toBeDefined()

        for (let b of resblogs) {
            expect(b.id).toBeDefined()
            expect(b.author).toBeDefined()
            expect(b.title).toBeDefined()
            expect(b.likes).toBeDefined()
        }
    })

    test('blogs returns single id', async () => {
        const resblogs = await get_and_check_json('/api/blogs')
        const b = resblogs[1]
        const res = await api.get('/api/blogs/' + b.id)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(res.body.id).toEqual(b.id)

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

    const find_blog_with_owner = ( blogs, owner  ) => {
        for ( let b of blogs ) {
            if ( b.user.username === owner ) {
                return  b
                
            }
        }
        return undefined
    }
    test('cannot delete without user', async () => {
        const resBef = await get_and_check_json('/api/blogs')
        const res = await api.delete('/api/blogs/' + resBef[0].id)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        expect(res.error).toBeDefined()
    })
    test('cannot delete with other user', async () => {
        const resBef = await get_and_check_json('/api/blogs')

        let to_delete = find_blog_with_owner( resBef, "test2")
        expect( to_delete ).toBeDefined()

        const res = await api.delete('/api/blogs/' + to_delete.id)
            .set('Authorization', AUTH_TOKEN)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        expect(res.error).toBeDefined()
    })

    test('proper delete works', async () => {
        const resBef = await get_and_check_json('/api/blogs')
        let to_delete = find_blog_with_owner( resBef, "test1")
        expect( to_delete ).toBeDefined()

        await api.delete('/api/blogs/' + to_delete.id)
            .set('Authorization', AUTH_TOKEN)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const resAfter = await get_and_check_json('/api/blogs')
        expect(resBef.length - 1).toEqual(resAfter.length)
    })

    test('invalid id gives error', async () => {
        const res = await api.delete('/api/blogs/deadbeef')
            .set('Authorization', AUTH_TOKEN)
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

    test('proper update works of', async () => {
        const resBef = await get_and_check_json('/api/blogs')
        const updated = resBef[0]
        updated.likes += 100
   
        const resNew = await updateBlog( {id:updated.id, likes:updated.likes })
        expect(resNew.id).toEqual(updated.id)
        expect(resNew.likes).toEqual(updated.likes)

        const resAfter = await get_and_check_json('/api/blogs/' + updated.id )
        expect( resAfter.author ).toEqual( updated.author )
        expect( resAfter.url ).toEqual( updated.url )
    })

    test('invalid id gives error', async () => {
        const res = await updateBlog({ id: "deadbeef" }, 400)
        expect(res.error).toBeDefined()
    })

    test('invalid content gives error', async () => {
        const resBef = await get_and_check_json('/api/blogs')
        const updated = resBef[0]
        updated.title = ""
        const res = await updateBlog(updated, 400)
        expect(res.error).toBeDefined()
    })
})
