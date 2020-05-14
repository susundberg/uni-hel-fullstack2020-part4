require('dotenv').config()

const PORT = process.env.PORT
const TOKEN_SECRET = process.env.TOKEN_SECRET

let MONGODB_URI = ""
if (process.env.NODE_ENV === 'production') {
    MONGODB_URI = process.env.MONGODB_URI
} else {
    MONGODB_URI = process.env.TEST_MONGODB_URI
}

module.exports = {
    MONGODB_URI,
    PORT,
    TOKEN_SECRET
}