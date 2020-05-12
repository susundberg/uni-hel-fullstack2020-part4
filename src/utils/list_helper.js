

const totalLikes = (blogs) => {
    return blogs.reduce((pv, cv) => (pv + cv.likes), 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length == 0)
        return {}

    const most = blogs.reduce((pv, cv) => ((cv.likes > pv.likes) ? cv : pv))
    return { 'author': most.author, 'likes': most.likes, 'title': most.title }
}

const mostAnything = (blogs, counter) => {
    const counted = blogs.reduce((pv, cv) => {
        if ( ( cv.author in pv ) === false )
        {
            pv[ cv.author ] = 0
        }
        pv[ cv.author ] += counter( cv )
        return pv
    }, {} )
    //console.log('mostAny', counted)
    const most = Object.keys(counted).reduce((pv, cv) => ((counted[cv] > counted[pv]) ? cv : pv))
    //console.log("most", most )
    return [ most, counted[most] ]
}

const mostBlogs = (blogs) => {
    if (blogs.length == 0)
        return {}
    
    const [mostA, mostB] = mostAnything( blogs, ()=>(1) )
    return { 'author': mostA, 'blogs' : mostB }
}

const mostLikes = (blogs) => {
    if (blogs.length == 0)
        return {}
    
    const [mostA, mostB] = mostAnything( blogs, (b)=>(b.likes) )
    return { 'author': mostA, 'likes' : mostB }
}

module.exports = { totalLikes, favoriteBlog, mostBlogs, mostLikes }
