
const blogs = require('./test_data').blogs
const listHelper = require('../src/utils/list_helper')


describe('total likes', () => {
    test('when list has only one blog', () => {
        const result = listHelper.totalLikes([blogs[0]])
        expect(result).toBe(blogs[0].likes)
    })
    test('when empty its zero', () => {
        const result = listHelper.totalLikes([])
        expect(result).toBe(0)
    })

    test('when long its sum', () => {
        const result = listHelper.totalLikes(blogs)
        expect(result).toBe(36)
    })
})

describe('favorite blogs', () => {
    test('it returns best', () => {
        const res = listHelper.favoriteBlog(blogs)
        expect(res).toEqual({
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12
        })
    })
    test('it empty on empty', () => {
        const res = listHelper.favoriteBlog([])
        expect(res).toEqual({})
    })

    test('list size 1', () => {
        const res = listHelper.favoriteBlog([blogs[0]])
        expect(res).toEqual({title: "React patterns", author: "Michael Chan", likes: 7})
    })
})


describe('most blogs', () => {
    test('it empty on empty', () => {
        const res = listHelper.mostBlogs([])
        expect(res).toEqual({})
    })
    test('list size 1', () => {
        const res = listHelper.mostBlogs([blogs[0]])
        expect(res).toEqual({author: "Michael Chan", blogs: 1})
    })
    test('list large', () => {
        const res = listHelper.mostBlogs(blogs)
        expect(res).toEqual({author: "Robert C. Martin", blogs: 6})
    })

})

describe('most likes', () => {
    test('it empty on empty', () => {
        const res = listHelper.mostLikes([])
        expect(res).toEqual({})
    })
    test('list size 1', () => {
        const res = listHelper.mostLikes([blogs[0]])
        expect(res).toEqual({author: "Michael Chan", likes: 7})
    })
    test('list large', () => {
        const res = listHelper.mostLikes(blogs)
        expect(res).toEqual({author:  "Edsger W. Dijkstra", likes: 17 })
    })

})
