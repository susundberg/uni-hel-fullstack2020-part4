const supertest = require('supertest')
const mongoose = require('mongoose')



const testData = require('./test_data')
const testHelp = require('./test_helpers.js')

const app = require('../src/app')
const api = supertest(app)


let AUTH_TOKEN = []

const login = async (index) => {
    const user = testData.users[index]
    const res = await testHelp.postLogin({ username: user.username, password: user.passwordPlain })
    expect(res.token).toBeDefined()
    return res.token
}


beforeEach(async () => {
    await testHelp.clearDBBlogs()
    await testHelp.initDBUsers()

    let token = await login(0)
    AUTH_TOKEN.push("bearer " + token)

    token = await login(1)
    AUTH_TOKEN.push("bearer " + token)

})

afterAll(() => {
    mongoose.connection.close()
})


describe('Create intial data', () => {

    const postComment = async (blogId, content, auth_index) => {
        const token = AUTH_TOKEN[auth_index]
        console.log('Comment:', content, token)
        const req = api.post(`/api/blogs/${blogId}/comments`)

        if (token)
            req.set('Authorization', token)

        req.send( { comment: content } )
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const created = await req
        return created.body
    }

    const postBlog = async (content, expected, auth_index) => {
        const token = AUTH_TOKEN[auth_index]
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

    test("Does what it says", async () => {
        console.log("Create blogs", testData.blogs)

        let n_blogs = [0, 0]

        for (let loop = 0; loop < testData.blogs.length; loop++) {
            const blog = testData.blogs[loop]

            await postBlog(blog, 201, loop % 2)
            n_blogs[loop % 2]++
        }

        const check_user_blogs = async () => {

            // Ok blogs created, check that users have stuff.
            const res = await api.get("/api/users")
                .expect(200)
                .expect('Content-Type', /application\/json/)
            console.log(res.body)
            const users = res.body

            expect(users.length).toEqual(testData.users.length)

            const findUser = (what) => users.find((x) => (x.username == testData.users[what].username))

            for (let loop = 0; loop < 2; loop++) {
                const u = findUser(loop)
                expect(u.blogs.length).toEqual(n_blogs[loop])
                console.log("User blogs", n_blogs[loop])
            }
        }
        await check_user_blogs()


        // Then make and check comments
        const check_comments = async () => {


            const get_blogs = async () => {
                const res = await api.get("/api/blogs")
                    .expect(200)
                    .expect('Content-Type', /application\/json/)
                return res.body
            }
            const get_blog = async (id) => {
                const res = await api.get("/api/blogs/" + id )
                    .expect(200)
                    .expect('Content-Type', /application\/json/)
                return res.body  
            }

            const blogs = await get_blogs()

            expect( blogs[0].comments).toBeDefined()
            expect( blogs[0].comments.length).toEqual(0)

            await postComment(blogs[0].id, "Comment 1 1", 0)
            await postComment(blogs[0].id, "Comment 1 2", 0)

            await postComment(blogs[1].id, "Comment 2 1", 0)
            await postComment(blogs[1].id, "Comment 2 2", 0)
            await postComment(blogs[1].id, "Comment 2 3", 0)

            const blogsA = await get_blog( blogs[0].id )
            expect( blogsA.comments.length).toEqual(2)
            const blogsB = await get_blog( blogs[1].id )
            expect( blogsB.comments.length).toEqual(3)
            const blogsC = await get_blog( blogs[2].id )
            expect( blogsC.comments.length).toEqual(0)

        }

        await check_comments()








    })


    // const res = await postBlog( blog, 200 )




})
