const bcrypt = require('bcrypt')

const blogs = [
    {  title: "React patterns", author: "Michael Chan", url: "https://reactpatterns.com/", likes: 7 },
    {  title: "Go To Statement Considered Harmful", author: "Edsger W. Dijkstra", url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", likes: 5 },
    {  title: "Canonical string reduction", author: "Edsger W. Dijkstra", url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", likes: 12 },
    {  title: "First class tests", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", likes: 10 },
    {  title: "First class tests1", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", likes: 0 },
    {  title: "TDD harms architecture", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", likes: 0 },
    { title: "Type wars", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 2},
    {  title: "Type wars2", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 0 },
    { title: "Type wars3", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 0 },
]

const newBlogs = [
    {  title: "New blog1", author: "Foo foo", url: "https://reactpatterns.com/1", likes: 7 },
    {  title: "New blog2", author: "Foo foo", url: "https://reactpatterns.com/2", likes: 7 },
]   

const users = [
    { name: 'Test user 1', username:'test1', passwordPlain:'TEST1'},
    { name: 'Test user 2', username:'test2', passwordPlain:'TEST2'},
    { name: 'Test user 3', username:'noblogs', passwordPlain:'NO_SINGLE_BLOG'},
]

const newUsers = [
    { name: 'New user 1', username:'new_test1', password:'LONGERNTEST1'},
    { name: 'New user 2', username:'new_test2', password:'LONGERNTEST2'},
]


const make_passwords = async (ulist) => {
    for ( let u of ulist )
    {
        u.password = await bcrypt.hash(u.passwordPlain, 10)
    }
}

make_passwords( users )

module.exports = { blogs, newBlogs, users, newUsers }