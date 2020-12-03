const User = require('../models/User');
const jwt = require('jsonwebtoken')

//Handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '', name: '', birthDate: '' };

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'Email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'Password is incorrect';
    }

    // duplicate error code
    if (err.code === 11000) {
        errors.email = "Email is already registered";
        return errors;
    }

    //validation erros
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message
        });
    }

    return errors;
}

const maxAge = 60 * 24 * 60 * 60 // the first 60 for days
const createToken = (id) => {
    return jwt.sign({ id }, 'net ninja secret', {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('authentification');
}

module.exports.ia_post = (req, res) => {
    res.render('ia');
}

module.exports.signup_post = async(req, res) => {
    const { email, password, name, birthDate } = req.body;
    try {
        const user = await User.create({ email, password, name, birthDate })
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user: user._id })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}