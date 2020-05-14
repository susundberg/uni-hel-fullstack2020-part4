const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../src/app')


const testData = require('./test_data')
const testHelp = require('./test_helpers.js')

const api = supertest(app)
beforeEach(async () => {
    await testHelp.initDBUsers()

})

afterAll(() => {
    mongoose.connection.close()
})

const get_and_check_json = async (url) => {
    const resUserRaw = await api.get(url)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    console.log("res", resUserRaw.body)
    return resUserRaw.body
}

describe('User GET methods', () => {
    test('it returns list', async () => {
        const res = await get_and_check_json("/api/users")
        expect(res.length).toEqual( testData.users.length )
        expect(res[0].id).toBeDefined()
        expect(res[0].password).toBeUndefined()
    })
})

describe('User POST methods', () => {


    const postUser = async (content, expected) => {
        console.log('Creating User:', content)
        if (expected === undefined)
            expected = 201

        const created = await api.post('/api/users')
            .send(content)
            .expect(expected)
            .expect('Content-Type', /application\/json/)

        return created.body
    }

    test('error on short pass', async () => {
        const newU = Object.assign({}, testData.newUsers[0])
        newU.password = "a"
        const res = await postUser(newU, 400)
        expect(res.error).toBeDefined()
    })

    test('error on invalid username', async () => {
        const newU = Object.assign({}, testData.newUsers[0])
        newU.username = "a"
        const res = await postUser(newU, 400)
        expect(res.error).toBeDefined()
        delete newU.username
        const res2 = await postUser(newU, 400)
        expect(res2.error).toBeDefined()
    })

    test('valid post creates', async () => {

        const before = await get_and_check_json("/api/users")

        const newU = Object.assign({}, testData.newUsers[0])
        const res = await postUser(newU)
        console.log('Ret', res)
        expect(res.id).toBeDefined()
        expect(res.name).toBeDefined()
        expect(res.username).toBeDefined()
        expect(res.password).toBeUndefined()

        const after = await get_and_check_json("/api/users")

        expect(before.length + 1).toEqual(after.length)
    })

    test('username is unique', async () => {
        const newU = Object.assign({}, testData.users[0])
        newU.password = "LONGPASSWORD"
        const res_fail = await postUser(newU, 400)
        expect(res_fail.error).toBeDefined()
    })


})
