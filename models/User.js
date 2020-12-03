const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter an password'],
        minlength: [6, 'Minimum password lenght is 6 characters'],
        maxlength: [250, 'Maximum password lenght is 250 characters']
    },
    name: {
        type: String,
        required: [true, 'Please enter an name'],
        minlength: [2, 'Minimum password lenght is 2 characters'],
        maxlength: [250, 'Maximum password lenght is 255 characters']
    },
    birthDate: {
        type: Date,
        required: [true, 'Please enter an valid date of birth'],
        minlength: [2, 'Minimum password lenght is 2 characters'],
        maxlength: [30, 'Maximum password lenght is 255 characters']
    }
})

// //fire a function after doc saved to db
// userSchema.post('save', function(doc, next) {
//     console.log('new user was created & saved', doc);
//     next();
// })

//fire a function before doc saved to db
userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();
});

//Static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });

    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}

const User = mongoose.model('user', userSchema)

module.exports = User;