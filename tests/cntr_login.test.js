
const mongoose = require('mongoose')
const User = require('../src/models/User')

const testData = require('./test_data')
const testHelp = require('./test_helpers')

const postLogin = testHelp.postLogin

beforeEach(async () => {
    await User.deleteMany({})
    const users = testData.users.map(x => new User(x))
    const promises = users.map(x => x.save())
    await Promise.all(promises)
})

afterAll(() => {
    mongoose.connection.close()
})


describe('Login', () => {

    test('valid login works', async () => {
        const user = testData.users[0]
        const res = await postLogin( {username:user.username, password: user.passwordPlain } )
        expect( res.token ).toBeDefined()
    })
    test('password check works', async () => {
        const user = testData.users[0]
        const res = await postLogin( {username:user.username, password: "invalid" }, 401 )
        expect( res.error ).toBeDefined()
        const res2 = await postLogin( {username:user.username }, 401 )
        expect( res2.error ).toBeDefined()
    })
})

module.exports = postLogin