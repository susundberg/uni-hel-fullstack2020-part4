const mongoose = require('mongoose')
const mongooseUValidator = require('mongoose-unique-validator')

const database = require('./database')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ],
})

const toJSON = ( doc, obj ) => 
{
    database.toJSON( doc, obj)
    delete obj.password
}

userSchema.set('toJSON', { transform: toJSON  })
userSchema.plugin(mongooseUValidator)


const User = mongoose.model('User', userSchema)


module.exports = User